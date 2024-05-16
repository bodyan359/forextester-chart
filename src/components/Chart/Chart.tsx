import React, {useEffect, useRef, useState} from "react";
import axios from "axios";
import { a, l } from "vite/dist/node/types.d-aGj9QkWt";

interface ForexData {
  // ChunkStart: number;
  Time: number;
  Open: number;
  High: number;
  Low: number;
  Close: number;
  TickVolume: number;
}

interface ForexChartProps {
  symbol: string;
}

const Chart: React.FC<ForexChartProps> = ({ symbol }) => {
  const [chartData, setChartData] = useState<any[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentStartIndex, setCurrentStartIndex] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isDragging = false;
    let lastX = 0;

    const handleMouseDown = (e: MouseEvent) => {
      isDragging = true;
      lastX = e.clientX;
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const deltaX = e.clientX - lastX;
      const scrollSpeed = 10; // Adjust scroll speed as needed
      const scrollAmount = deltaX * scrollSpeed;
      const barWidth = (canvas.width - 20 * 2) / chartData.length;
      const startIndex = Math.max(0, currentStartIndex - Math.floor(scrollAmount / barWidth));

      // console.log(chartData)
      drawChart(chartData.slice(startIndex));
      setCurrentStartIndex(startIndex);

      lastX = e.clientX;
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const deltaY = e.deltaY;

      // Determine the zoom direction (positive delta for zoom in, negative for zoom out)
      const zoomDirection = deltaY > 0 ? -1 : 1;

      // Adjust the scale factor based on the zoom direction (you can adjust the scale factor as needed)
      const scaleFactor = 0.5; // Adjust the scale factor as needed
      const zoomFactor = 1 + zoomDirection * scaleFactor;

      // Update the chart based on the zoom factor
      zoomChart(zoomFactor);
    };

    const zoomChart = (zoomFactor: number) => {
      // Adjust the scale of the chart based on the zoom factor
      // For example, you can multiply the bar width by the zoom factor to zoom in/out
      // Update other chart parameters as needed

      // Redraw the chart with the updated scale
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      console.log('zoomFactor',zoomFactor);
      ctx.scale(zoomFactor, zoomFactor);
    };


    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('wheel', handleWheel);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, [canvasRef]);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `https://beta.forextester.com/data/api/Metadata/bars/chunked?Broker=Advanced&Symbol=${symbol}&Timeframe=1&Start=57674&End=59113&UseMessagePack=false`,
        );
        const data = response.data || [];

        // Process the data and draw the chart
        // const barsData = data.map(item => item["Bars"]).flat();
        // if(chartData.length < 1) setChartData(barsData);
        setChartData(data.map(item => item["Bars"]).flat())
        data.length > 0 && drawChart(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [symbol]);

  console.log('cha',chartData)
  const drawChart = (data: any[]) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Extract bars data
    const barsData = data.map(item => item["Bars"]).flat();

    // Calculate chart parameters
    const margin = 20;
    const barWidth = (canvas.width - margin * 2) / barsData.length;
    const highestPrice = Math.max(...barsData.map(bar => bar?.High));
    const lowestPrice = Math.min(...barsData.map(bar => bar?.Low));
    const priceRange = highestPrice - lowestPrice;
    const pricePerPixel = (canvas.height - margin * 2) / priceRange;

    // Draw bars
     barsData.forEach((bar, index) => {
      const x = margin + index * barWidth;
      const yOpen = (highestPrice - bar?.Open) * pricePerPixel + margin;
      const yClose = (highestPrice - bar?.Close) * pricePerPixel + margin;
      const yHigh = (highestPrice - bar?.High) * pricePerPixel + margin;
      const yLow = (highestPrice - bar?.Low) * pricePerPixel + margin;

      ctx.strokeStyle = bar?.Open > bar?.Close ? 'red' : 'green';
      ctx.lineWidth = 0.7;
      ctx.beginPath();
      ctx.moveTo(x, yHigh);
      ctx.lineTo(x, yLow);
      ctx.stroke();

      ctx.lineWidth = barWidth;
      ctx.beginPath();
      ctx.moveTo(x, yOpen);
      ctx.lineTo(x, yClose);
      ctx.stroke();
    });
  };


  return <canvas id='myCanvas' ref={canvasRef} />;
};

export default Chart;
