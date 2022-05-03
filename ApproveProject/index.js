const df = require("durable-functions");

module.exports = async function (context, req) {

    const oid = req.params.orcInstanceId;
    
    if (!oid) {
        return "Orchestrator instance id is required";
    }

    const client = df.getClient(context);

    await client.raiseEvent(oid, "Approval", true);

    return { status: 200, body: "Project approval submitted" };
};