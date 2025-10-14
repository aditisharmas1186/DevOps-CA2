# Cloud-Based Sentiment Analysis Platform (AWS + BERT)

This project is a real-time sentiment analysis platform that classifies tweets as **Positive**, **Negative**, or **Neutral** using a fine-tuned **BERT** model. It is deployed on **AWS infrastructure** and features a simple **Gradio interface** for live predictions.

---

## Overview

This application demonstrates the integration of **Machine Learning**, **Cloud Computing**, and basic **API development** to deliver a secure, scalable, and accessible sentiment analysis solution.

- Real-time classification of tweets using a BERT model.
- Gradio-powered web interface for user interaction.
- Hosted on AWS EC2 with model artifacts stored in S3.
- Secure data access managed via IAM.
- CloudWatch and CloudTrail enable performance monitoring and auditing.

---

## Technologies Used

- **Language**: Python
- **Machine Learning**: BERT (Hugging Face Transformers)
- **Frontend**: Gradio
- **Cloud Platform**: AWS (EC2, S3, RDS, IAM, CloudWatch, CloudTrail)
- **Database**: MySQL on Amazon RDS
- **API**: Custom Python-based inference service
- **Version Control**: GitHub

---

## Dataset

- **Source**: Twitter Training Dataset
- **Fields**: Tweet ID, Tweet Content, Entity, Sentiment
- **Classes**: Positive, Negative, Neutral
- **Preprocessing**: Noise removal (hashtags, mentions, URLs), tokenization using Transformers

---

## How It Works

1. User inputs a tweet through the Gradio interface.
2. The tweet is sent to a Python API endpoint for processing.
3. The BERT model analyzes the tweet and returns its sentiment.
4. The result is instantly displayed on the frontend.

---

## Run Locally

```bash
# Clone the repository
git clone https://github.com/yourusername/sentiment-analysis-aws.git
cd sentiment-analysis-aws

# (Optional) Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the Gradio app
python app.py
