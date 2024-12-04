import mlflow
import openai
import os
import pandas as pd
import dagshub
dagshub.init(repo_owner='longlee11', repo_name='my-first-repo', mlflow=True)
mlflow.set_tracking_uri("https://dagshub.com/longlee11/my-first-repo.mlflow")

# # you must set the OPENAI_API_KEY environment variable
# assert (
#   "OPENAI_API_KEY" in os.environ
# ), "Please set the OPENAI_API_KEY environment variable."

# # set the experiment id
# mlflow.set_experiment(experiment_id="26193767216302")


eval_data = pd.DataFrame(
    {
        "inputs": [
            "What is MLflow?",
            "What is Spark?",
            "Which is bigger, 50 or 100?",
            "Cái nào nặng hơn, 1kg gạo hay 1kg bông?",
            "Cái nào có giá trị hơn, vàng hay bạc?",
            "What is machine learning?",
            "How does useEffect() work?",
            "What does the static keyword in a function mean?",
            "What is the difference between multiprocessing and multithreading?"
        ],
        "ground_truth": [
            "MLflow is an open-source platform for managing the end-to-end machine learning (ML) "
            "lifecycle. It was developed by Databricks, a company that specializes in big data and "
            "machine learning solutions. MLflow is designed to address the challenges that data "
            "scientists and machine learning engineers face when developing, training, and deploying "
            "machine learning models.",
            "Apache Spark is an open-source, distributed computing system designed for big data "
            "processing and analytics. It was developed in response to limitations of the Hadoop "
            "MapReduce computing model, offering improvements in speed and ease of use. Spark "
            "provides libraries for various tasks such as data ingestion, processing, and analysis "
            "through its components like Spark SQL for structured data, Spark Streaming for "
            "real-time data processing, and MLlib for machine learning tasks",
            "100",
            "1kg gạo và 1kg bông đều nặng như nhau",
            "Vàng",
            "Machine learning is a subset of AI that enables systems to learn and improve from experience without explicit programming.",
            "The useEffect() hook tells React that your component needs to do something after render. React will remember the function you passed (we’ll refer to it as our “effect”), and call it later after performing the DOM updates.",
            "Static members belong to the class, rather than a specific instance. This means that only one instance of a static member exists, even if you create multiple objects of the class, or if you don't create any. It will be shared by all objects.",
            "Multithreading refers to the ability of a processor to execute multiple threads concurrently, where each thread runs a process. Whereas multiprocessing refers to the ability of a system to run multiple processors in parallel, where each processor can run one or more threads."
        ],
    }
)


mlflow.set_experiment(experiment_name="LLM for testing")
# mlflow.set_experiment("LLM for testing")
with mlflow.start_run() as run:
    system_prompt = "You are an ai chatbot. You have to help user answer from User Question based on Context and Conversation History following below criterias. \n1. Response briefly but clearly\n2. Add sources to your users\n3. Response according to user languages which they enter"
    logged_model_info = mlflow.openai.log_model(
        model="gpt-3.5-turbo",
        task=openai.chat.completions,
        artifact_path="model",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": "{question}"},
        ],
    )

    # Use predefined question-answering metrics to evaluate our model.
    results = mlflow.evaluate(
        logged_model_info.model_uri,
        eval_data,
        targets="ground_truth",
        model_type="question-answering",
        extra_metrics=[
            mlflow.metrics.toxicity(),
            mlflow.metrics.latency(),
            mlflow.metrics.genai.answer_similarity(),
            mlflow.metrics.flesch_kincaid_grade_level(),
            mlflow.metrics.ari_grade_level(),
            mlflow.metrics.precision_score(),
            mlflow.metrics.recall_score(),
            mlflow.metrics.f1_score(),
            mlflow.metrics.exact_match()
        ]
    )

    print(f"See aggregated evaluation results below: \n{results.metrics}")

    # Evaluation result for each data record is available in `results.tables`.
    eval_table = results.tables["eval_results_table"]
    df=pd.DataFrame(eval_table)
    df.to_csv('test1.csv')
    print(f"See evaluation table below: \n{eval_table}")