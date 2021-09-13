import Express from "express"; 
import dotenv from 'dotenv';
import Agenda from "agenda";
import dayjs from "dayjs";

const app = Express();
const env = dotenv.config();
const jobQueue = new Agenda({
    db: {
        address: env.DB_MONGO_URL,
        collection: "jobs"
    }
});

jobQueue.define("instantJob", async job => {
    const data = job?.attrs?.data
    console.log(
        "This job is running as soon as it was received. This is the data that was sent:"
    );
    console.log(data);
});

jobQueue.define("delayedJob", async job => {
    const data = job?.attrs?.data
    console.log(
        "This job is running after a 5 second delay. This is the data that was sent:"
    );
    console.log(data);
});

jobQueue.start();
app.get('/jobs', (req, res) => {
    const jobType = req?.query?.jobType;
    const allowedJobs = Object.keys(jobQueue._definitions);

    if (!jobType) {
        return res.send("Must pass a jobType in the query params.");
    }

    if (!allowedJobs.includes(jobType)) {
        return res.send(
            `${jobType} is not supported. Must pass one of ${allowedJobs.join(
            ", or "
            )} as jobType in the query params.`
        );
    }

    if (jobType == "instantJob") {
        jobQueue.now(req?.query?.jobType, req.body);
    }

    if (jobQueue == "delayedJob") {
        jobQueue.schedule(
            dayjs().add(5, "seconds").format(),
            req?.query?.jobType,
            req.body
        );
    }
    res.send("Job added to queue!");
});

app.listen(8082);