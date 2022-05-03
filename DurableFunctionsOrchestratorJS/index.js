/*
 * This function is not intended to be invoked directly. Instead it will be
 * triggered by an HTTP starter function.
 * 
 */

const df = require("durable-functions");
const { DateTime } = require("luxon");

module.exports = df.orchestrator(function* (context) {
    const outputs = [];

    const { projectName } = context.df.getInput();

    if (!projectName) {
        outputs.push("Project name is required");
        return outputs;
    }

    const project = {
        name: projectName
    };

    const deadline = DateTime.fromJSDate(context.df.currentUtcDateTime, { zone: 'utc' }).plus({ seconds: 10 });
    
    const deadlineTask = context.df.createTimer(deadline.toJSDate());
    const approvalTask = context.df.waitForExternalEvent("Approval");

    const completedTask = yield context.df.Task.any([approvalTask, deadlineTask]);

    if (completedTask == approvalTask) {
        deadlineTask.cancel();
        outputs.push(yield context.df.callActivity("Approval", project));
    } else {
        outputs.push(yield context.df.callActivity("Escalation", project));
    }

    return outputs;
});