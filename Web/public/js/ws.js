const ws = new WebSocket("ws://localhost:3001");

ws.addEventListener("open", () => {
    console.log("Connected from Website");
});

ws.addEventListener("message", ({ data }) => {
    console.log("data", data)

    switch(data.type) {
        case "trade":
            // post trade notification

        break;

        case "operation":
            // update operation

        break;
    }
})