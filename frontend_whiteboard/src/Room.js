// Room.js

import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import Canvas from "./Canvas";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const Room = ({ userNo, socket, setUsers, setUserNo }) => {
  const canvasRef = useRef(null);
  const ctx = useRef(null);
  const [color, setColor] = useState("#000000");
  const [elements, setElements] = useState([]);
  const [history, setHistory] = useState([]);
  const [tool, setTool] = useState("pencil");
  const [brushSize, setBrushSize] = useState(2);

  useEffect(() => {
    socket.on("message", (data) => {
      toast.info(data.message);
    });
  }, []);

  useEffect(() => {
    socket.on("users", (data) => {
      setUsers(data);
      setUserNo(data.length);
    });
  }, []);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    context.fillStyle = "white";
    context.fillRect(0, 0, canvas.width, canvas.height);
    setElements([]);
  };

  const undo = () => {
    setHistory((prevHistory) => [
      ...prevHistory,
      elements[elements.length - 1],
    ]);
    setElements((prevElements) =>
      prevElements.filter((ele, index) => index !== elements.length - 1)
    );
  };

  const redo = () => {
    setElements((prevElements) => [
      ...prevElements,
      history[history.length - 1],
    ]);
    setHistory((prevHistory) =>
      prevHistory.filter((ele, index) => index !== history.length - 1)
    );
  };

  const increaseBrushSize = () => {
    setBrushSize((prevSize) => prevSize + 1);
  };

  const decreaseBrushSize = () => {
    setBrushSize((prevSize) => Math.max(1, prevSize - 1));
  };

  const saveAsPDF = () => {
    const canvas = canvasRef.current;

    html2canvas(canvas).then((canvasImage) => {
      const imgData = canvasImage.toDataURL("image/png");

      const pdf = new jsPDF("landscape", "px", [canvas.width, canvas.height]);

      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);

      pdf.save("canvas-drawing.pdf");
    });
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12 text-center">
          <h1 className="display-5 pt-4 pb-3">
            React Drawing App - users online: {userNo}
          </h1>
        </div>
      </div>
      <div className="row">
        <div className="col-md-6 offset-md-3 col-12">
          <div className="color-picker d-flex align-items-center justify-content-center">
            Color Picker: &nbsp;
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
            />
            &nbsp;&nbsp; Brush Size: {brushSize}
            &nbsp;&nbsp;
            <button
              type="button"
              className="btn btn-outline-primary btn-sm"
              onClick={decreaseBrushSize}
            >
              -
            </button>
            &nbsp;
            <button
              type="button"
              className="btn btn-outline-primary btn-sm"
              onClick={increaseBrushSize}
            >
              +
            </button>
          </div>
        </div>
        <div className="col-md-6 offset-md-2 col-12 mt-4">
          <div className="form-check form-check-inline ">
            <input
              className="form-check-input"
              type="radio"
              name="tools"
              id="pencil"
              value="pencil"
              checked={tool === "pencil"}
              onChange={(e) => setTool(e.target.value)}
            />
            <label className="form-check-label" htmlFor="pencil">
              Pencil
            </label>
          </div>
          <div className="form-check form-check-inline">
            <input
              className="form-check-input"
              type="radio"
              name="tools"
              id="line"
              value="line"
              checked={tool === "line"}
              onChange={(e) => setTool(e.target.value)}
            />
            <label className="form-check-label" htmlFor="line">
              Line
            </label>
          </div>
          <div className="form-check form-check-inline">
            <input
              className="form-check-input"
              type="radio"
              name="tools"
              id="rect"
              value="rect"
              checked={tool === "rect"}
              onChange={(e) => setTool(e.target.value)}
            />
            <label className="form-check-label" htmlFor="rect">
              Rectangle
            </label>
          </div>
        </div>

        <div className="col-md-6 offset-md-2 col-12 mt-3 ">
          <button
            type="button"
            className="btn btn-outline-primary"
            disabled={elements.length === 0}
            onClick={undo}
          >
            Undo
          </button>
          &nbsp;&nbsp;
          <button
            type="button"
            className="btn btn-outline-primary ml-1"
            disabled={history.length < 1}
            onClick={redo}
          >
            Redo
          </button>
          &nbsp;&nbsp;
          <input
            type="button"
            className="btn btn-danger"
            value="Clear Canvas"
            onClick={clearCanvas}
          />
          &nbsp;&nbsp;
          <input
            type="button"
            className="btn btn-success"
            value="Save as PDF"
            onClick={saveAsPDF}
          />
        </div>
      </div>
      <div className="row">
        {console.log(brushSize)}
        <Canvas
          canvasRef={canvasRef}
          ctx={ctx}
          color={color}
          setElements={setElements}
          elements={elements}
          tool={tool}
          socket={socket}
          brushSize={brushSize}
        />
      </div>
    </div>
  );
};

export default Room;
