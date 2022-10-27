const ws = new WebSocket("ws://localhost:3001");

ws.addEventListener("open", () => {
    console.log("Connected from Website");
});

ws.addEventListener("message", ({ data }) => {
    data = JSON.parse(data)

    switch(data.type) {
        case "trade":
            // post trade notification
            console.log("trade data", data)
        break;

        case "operation":
            // update operation
            const operation = data.data;
            console.log("operation data", operation)
            updateHtmlOperation(operation)
        break;

        case "instanceID":
            // instanceID
            const instanceID = data.data.instanceID;
            setInstanceID(instanceID)
        break;
    }
})