const ws = new WebSocket("ws://localhost:3001");

ws.addEventListener("open", () => {
    console.log("Connected from Website");
});

ws.addEventListener("message", ({ data }) => {
    data = JSON.parse(data)

    switch(data.type) {
        case "trade":
            // post trade notification
            const trade = data.data;
            // format { type, symbol, entry_price, symbol_quantity, usdt_quantity, time, bot_strategy, bot_options, chart_id, bot_id, bot_name, trade_id }
            addTradeToHtml(trade)
        break;

        case "operation":
            // update operation
            const operation = data.data;
            updateHtmlOperation(operation)
        break;

        case "instanceID":
            // instanceID
            const instanceID = data.data.instanceID;
            setInstanceID(instanceID)
        break;
    }
})