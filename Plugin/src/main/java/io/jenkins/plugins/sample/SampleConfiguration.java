package io.jenkins.plugins.sample;

import hudson.Extension;
import hudson.util.Secret;
import java.util.logging.Logger;
import javax.annotation.Nonnull;
import jenkins.model.GlobalConfiguration;
import net.sf.json.JSONObject;
import org.kohsuke.stapler.StaplerRequest;

@Extension
public class SampleConfiguration extends GlobalConfiguration {

    private static final Logger LOGGER = Logger.getLogger(SampleConfiguration.class.getName());

    private Secret jenkinsToken;
    private Secret sonarToken;
    private String sonarUrl;
    private String projectKey;
    private Secret secretKey;
    private Secret ivKey;

    public SampleConfiguration() {
        load();
    }

    public static SampleConfiguration get() {
        return GlobalConfiguration.all().get(SampleConfiguration.class);
    }

    @Nonnull
    @Override
    public String getDisplayName() {
        return "Pipeline Insight Plugin Configuration";
    }

    @Override
    public boolean configure(StaplerRequest req, JSONObject json) throws FormException {
        req.bindJSON(this, json);
        save();
        return true;
    }

    public Secret getJenkinsToken() {
        return jenkinsToken;
    }

    public void setJenkinsToken(Secret jenkinsToken) {
        this.jenkinsToken = jenkinsToken;
    }

    public Secret getSonarToken() {
        return sonarToken;
    }

    public void setSonarToken(Secret sonarToken) {
        this.sonarToken = sonarToken;
    }

    public String getSonarUrl() {
        return sonarUrl;
    }

    public void setSonarUrl(String sonarUrl) {
        this.sonarUrl = sonarUrl;
    }

    public void setProjectKey(String projectKey) {
        this.projectKey = projectKey;
    }

    public String getProjectKey() {
        return projectKey;
    }

    public Secret getSecretKey() {
        return secretKey;
    }

    public void setSecretKey(Secret secretKey) {
        this.secretKey = secretKey;
    }

    public Secret getIvKey() {
        return ivKey;
    }

    public void setIvKey(Secret ivKey) {
        this.ivKey = ivKey;
    }
}
