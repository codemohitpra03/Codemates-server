const {Kafka} = require('kafkajs')
async function run(msg){
    try {
        const kafka = new Kafka({
            "clientId":"codemates",
            "brokers":[`${process.env.kakfka_ip}:9092`]
        })

        const producer = kafka.producer()

        console.log("connecting....");
        await producer.connect()
        console.log("connected");
        
        // const partition = msg[0] < "n" ? 0 : 1;
        const result  = await producer.send({
            "topic": "users",
            "messages": [{
                "value": JSON.stringify(msg),
                "partition": 0
            }]
        })

        console.log(`sent successfully ${JSON.stringify(result)}`);

        await producer.disconnect()
    } catch (error) {
        console.log("error happenend" , error );
    }finally{
        // process.exit(0)
    }
}

// run()

module.exports = {
    run
}