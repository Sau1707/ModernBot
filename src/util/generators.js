function generateTaskID(command, data) {
    return `${command}:${JSON.stringify(data)}`
}
