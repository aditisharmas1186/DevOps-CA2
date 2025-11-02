package io.jenkins.plugins.sample;

import hudson.Extension;
import hudson.model.Cause;
import hudson.model.Run;
import hudson.model.TaskListener;
import hudson.model.listeners.RunListener;
import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Base64;
import javax.crypto.Cipher;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import org.json.JSONArray;
import org.json.JSONObject;

@Extension
public class HelloWorldListener extends RunListener<Run<?, ?>> {

    @Override
    public void onCompleted(Run<?, ?> run, TaskListener listener) {

        listener.getLogger().println("Build Completed: " + run.getFullDisplayName());
        try {
            SampleConfiguration config = SampleConfiguration.get();
            if (config == null) {
                listener.getLogger().println("ERROR: Plugin configuration is not available.");
                return;
            }
            Cause.UserIdCause userCause = run.getCause(Cause.UserIdCause.class);
            String jenkinsUser = (userCause != null) ? userCause.getUserId() : "SYSTEM";
            String jenkinsToken = config.getJenkinsToken().getPlainText();
            String sonarToken = config.getSonarToken().getPlainText();
            String sonarUrl = config.getSonarUrl();
            String projectKey = config.getProjectKey();
            String secretKey = config.getSecretKey().getPlainText();
            String ivKey = config.getIvKey().getPlainText();

            String jenkinsUrl = System.getenv().getOrDefault("JENKINS_URL", "http://localhost:8080/");
            String jobName = run.getParent().getName();
            int buildNumber = run.getNumber();

            String apiUrl = jenkinsUrl + "job/" + jobName + "/" + buildNumber + "/api/json";
            String wfApiUrl = jenkinsUrl + "job/" + jobName + "/" + buildNumber + "/wfapi/describe";
            String testReportUrl = jenkinsUrl + "job/" + jobName + "/" + buildNumber + "/testReport/api/json";
            String sonarRes = sonarUrl + "/api/measures/component?component=" + projectKey + "&metricKeys=coverage";

            String buildData = callJenkinsAPI(apiUrl, jenkinsUser, jenkinsToken);
            String stageDescribe = callJenkinsAPI(wfApiUrl, jenkinsUser, jenkinsToken);
            String testResult = callJenkinsAPI(testReportUrl, jenkinsUser, jenkinsToken);
            String sonarqubeResult = callSonarAPI(sonarRes, sonarToken);

            JSONObject wfObj = new JSONObject(stageDescribe);
            JSONArray stages = wfObj.getJSONArray("stages");
            JSONArray nodeStageDataArr = new JSONArray();

            for (int i = 0; i < stages.length(); i++) {
                JSONObject stage = stages.getJSONObject(i);
                String nodeId = stage.getString("id");
                String nodeApiUrl = jenkinsUrl + "job/" + jobName + "/" + buildNumber + "/execution/node/" + nodeId
                        + "/wfapi/describe";
                String nodeData = callJenkinsAPI(nodeApiUrl, jenkinsUser, jenkinsToken);

                JSONObject nodeObj = new JSONObject();
                nodeObj.put("nodeId", nodeId);
                nodeObj.put("data", new JSONObject(nodeData));
                nodeStageDataArr.put(nodeObj);
            }

            JSONObject payload = new JSONObject();
            payload.put("build_data", new JSONObject(buildData));
            payload.put("stage_data", new JSONArray().put(new JSONObject(stageDescribe)));
            payload.put("node_stage_data", nodeStageDataArr);
            payload.put("test_data", new JSONObject(testResult));
            payload.put("sonar_data", new JSONObject(sonarqubeResult));

            String payloadStr = payload.toString();
            String checksum = computeSHA256(payloadStr);
            String timestamp = checksum + " " + System.currentTimeMillis();
            String encryptedTimestamp = encryptTimestamp(timestamp, secretKey, ivKey);

            listener.getLogger().println("Payload Checksum: " + checksum);
            listener.getLogger().println("Encrypted Timestamp: " + encryptedTimestamp);

            sendPayloadToExternalAPI(payloadStr, checksum, encryptedTimestamp);

        } catch (Exception e) {
            listener.getLogger().println("Error: " + e.getMessage());
        }
    }

    private String computeSHA256(String data) throws Exception {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        byte[] hash = digest.digest(data.getBytes(StandardCharsets.UTF_8));
        StringBuilder hexString = new StringBuilder();
        for (byte b : hash) {
            hexString.append(String.format("%02x", b));
        }
        return hexString.toString();
    }

    private String encryptTimestamp(String timestamp, String secretKey, String ivKey) throws Exception {
        SecretKeySpec keySpec = new SecretKeySpec(secretKey.getBytes(StandardCharsets.UTF_8), "AES");
        IvParameterSpec ivSpec = new IvParameterSpec(ivKey.getBytes(StandardCharsets.UTF_8));
        Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
        cipher.init(Cipher.ENCRYPT_MODE, keySpec, ivSpec);
        byte[] encrypted = cipher.doFinal(timestamp.getBytes(StandardCharsets.UTF_8));
        return Base64.getEncoder().encodeToString(encrypted);
    }

    private void sendPayloadToExternalAPI(String payload, String checksum, String encryptedTimestamp) throws Exception {
        URL url = new URL("http://localhost:3000/");
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("POST");
        conn.setRequestProperty("Content-Type", "application/json");
        conn.setRequestProperty("X-Encrypted-Timestamp", encryptedTimestamp);
        conn.setDoOutput(true);

        try (OutputStream os = conn.getOutputStream()) {
            byte[] input = payload.getBytes(StandardCharsets.UTF_8);
            os.write(input, 0, input.length);
        }

        if (conn.getResponseCode() != 200 && conn.getResponseCode() != 201) {
            throw new RuntimeException("HTTP Error: " + conn.getResponseCode());
        }
    }

    private String callJenkinsAPI(String apiUrl, String jenkinsUser, String jenkinsToken) throws Exception {
        HttpURLConnection conn = (HttpURLConnection) new URL(apiUrl).openConnection();
        conn.setRequestMethod("GET");
        String auth =
                Base64.getEncoder().encodeToString((jenkinsUser + ":" + jenkinsToken).getBytes(StandardCharsets.UTF_8));
        conn.setRequestProperty("Authorization", "Basic " + auth);
        return readResponse(conn);
    }

    private String callSonarAPI(String apiUrl, String sonarToken) throws Exception {
        HttpURLConnection conn = (HttpURLConnection) new URL(apiUrl).openConnection();
        conn.setRequestMethod("GET");
        String auth = Base64.getEncoder().encodeToString((sonarToken + ":").getBytes(StandardCharsets.UTF_8));
        conn.setRequestProperty("Authorization", "Basic " + auth);
        return readResponse(conn);
    }

    private String readResponse(HttpURLConnection conn) throws Exception {
        try (BufferedReader in =
                new BufferedReader(new InputStreamReader(conn.getInputStream(), StandardCharsets.UTF_8))) {
            StringBuilder response = new StringBuilder();
            String line;
            while ((line = in.readLine()) != null) {
                response.append(line);
            }
            return response.toString();
        }
    }
}
