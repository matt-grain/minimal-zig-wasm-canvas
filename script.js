var memory = new WebAssembly.Memory({
    initial: 2 /* pages */,
    maximum: 15 /* pages */,
});

const text_decoder = new TextDecoder();
let console_log_buffer = "";

var importObject = {
    env: {
        consoleLogJS: (arg, len) => {
            let arr8 = new Uint8Array(memory.buffer.slice(arg, arg+len));
            console.log(new TextDecoder().decode(arr8));
        },
        jsConsoleLogWrite: function (ptr, len) {
            let arr8 = new Uint8Array(memory.buffer.slice(ptr, ptr+len));
            console_log_buffer += text_decoder.decode(arr8);
        },
        jsConsoleLogFlush: function () {
            console.log(console_log_buffer);
            console_log_buffer = "";
        },   
        memory: memory,
    },
};


WebAssembly.instantiateStreaming(fetch("checkerboard.wasm"), importObject).then((result) => {
    const wasmMemoryArray = new Uint8Array(memory.buffer);

    const canvas = document.getElementById("checkerboard");
    const context = canvas.getContext("2d");
    const imageData = context.createImageData(canvas.width, canvas.height);
    context.clearRect(0, 0, canvas.width, canvas.height);

    const getDarkValue = () => {
        return Math.floor(Math.random() * 100);
    };
    const getLightValue = () => {
        return Math.floor(Math.random() * 127) + 127;
    };

    const checkString = () => {
        result.instance.exports.stringCheck();  
    };

    const drawCheckerboard = () => {
        const checkerBoardSize = 8;

        result.instance.exports.colorCheckerboard(
            getDarkValue(),
            getDarkValue(),
            getDarkValue(),
            getLightValue(),
            getLightValue(),
            getLightValue()
        );

        const bufferOffset = result.instance.exports.getCheckerboardBufferPointer();
        const imageDataArray = wasmMemoryArray.slice(
            bufferOffset,
            bufferOffset + checkerBoardSize * checkerBoardSize * 4
        );
        imageData.data.set(imageDataArray);

        context.clearRect(0, 0, canvas.width, canvas.height);
        context.putImageData(imageData, 0, 0);
    };


    checkString();
    drawCheckerboard();
    console.log(memory.buffer);
    setInterval(() => {
        drawCheckerboard();
    }, 250);
});
