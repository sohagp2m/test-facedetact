import React, { useRef, useEffect, useState } from "react";
import Webcam from "react-webcam";
import * as faceapi from "face-api.js";

const ExamStart = () => {
  const webcamRef = useRef(null);
  const [faceCount, setFaceCount] = useState(0);
  const [prevFaceX, setPrevFaceX] = useState(null);
  const [position, setPosition] = useState("");

  useEffect(() => {
    Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
      faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
      faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
    ]).then(startFaceDetection);
  }, []);

  const startFaceDetection = () => {
    setInterval(() => {
      detectFaces();
    }, 1000);
  };

  const detectFaces = async () => {
    if (webcamRef.current) {
      const videoEl = webcamRef.current.video;
      const result = await faceapi.detectAllFaces(videoEl, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks();

      if (result.length > 0) {
        const currentFaceX = result[0].landmarks._positions[0].x;
        if (prevFaceX !== null) {
          const movementThreshold = 10;
          const deltaX = currentFaceX - prevFaceX;

          if (deltaX > movementThreshold) {
            setPosition("Moved to the right");
          } else if (deltaX < -movementThreshold) {
            setPosition("Moved to the left");
          }
        }

        setPrevFaceX(currentFaceX);
      }

      setFaceCount(result.length);
    }
  };

  return (
    <div className="max-w-4xl w-full text-2xl mx-auto p-10 h-screen flex flex-col items-center justify-center">
      <h1 className="font-bold text-5xl">For Camera Test</h1>
      <Webcam
        ref={webcamRef}
        audio={false}
        mirrored={true}
        screenshotFormat="image/jpeg"
      />
      <p>Number of Faces: {faceCount}</p>
      <p>Face Postion: {position}</p>
    </div>
  );
};

export default ExamStart;
