
# CodeMates Backend Server





*Backend Server for Real-Time Collaborative Code Editor and Compiler Platform*

**Overview:**
The Backend server manages sockets and manages the code execution requests by being a *producer* for *message queue*.




**Technologies Used:**
- Backend: Node.js, Express.js, Kafka
- Languages: C++, Java, JavaScript, Python



---




## Run Locally

* Clone the project

```bash
  git clone https://github.com/codemohitpra03/Codemates-server
```

Go to the project directory

```bash
  cd Codemates-server
```

Install dependencies

```bash
  npm install
```

Start the server

```bash
  npm run start
```

* Start Zookeper Container and expose PORT ```2181```.
```bash
docker run -p 2181:2181 zookeeper
```

* Start Kafka Container, expose PORT ```9092``` and setup ENV variables.
```bash
docker run -p 9092:9092 \
-e KAFKA_ZOOKEEPER_CONNECT=<PRIVATE_IP>:2181 \
-e KAFKA_ADVERTISED_LISTENERS=PLAINTEXT://<PRIVATE_IP>:9092 \
-e KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR=1 \
confluentinc/cp-kafka
```


This spins up only the backend server of CodeMates

To run Other services, Go to below listed repositories and follow the instructions


* https://github.com/codemohitpra03/CodeMates
* https://github.com/codemohitpra03/Codemates-worker-compiler


## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

`KAFKA IP` IP address of machine where kafka is running. Pass this as the private ip while running locally.




## Authors

- [@codemohitpra03](https://www.github.com/codemohitpra03)

