import React from 'react';

interface StockChartProps {
    historicalData: number[];
    averagePrice?: number;
}

const StockChart: React.FC<StockChartProps> = ({ historicalData, averagePrice }) => {
    const svgWidth = 500;
    const svgHeight = 200;
    const padding = { top: 20, right: 50, bottom: 20, left: 50 };

    const chartWidth = svgWidth - padding.left - padding.right;
    const chartHeight = svgHeight - padding.top - padding.bottom;

    const dataMin = Math.min(...historicalData);
    const dataMax = Math.max(...historicalData);
    const yRange = dataMax - dataMin;
    
    // Add some padding to the y-axis
    const yMin = Math.max(0, dataMin - yRange * 0.1);
    const yMax = dataMax + yRange * 0.1;
    
    const xScale = (index: number) => (index / (historicalData.length - 1)) * chartWidth + padding.left;
    const yScale = (price: number) => chartHeight - ((price - yMin) / (yMax - yMin)) * chartHeight + padding.top;
    
    // Generate y-axis labels
    const yAxisLabels = [];
    const numLabels = 5;
    for (let i = 0; i < numLabels; i++) {
        const price = yMin + (i / (numLabels - 1)) * (yMax - yMin);
        yAxisLabels.push({ price, y: yScale(price) });
    }

    const avgPriceY = averagePrice && averagePrice >= yMin && averagePrice <= yMax ? yScale(averagePrice) : null;
    
    // Determine the overall chart color based on the last day's change
    let overallClassName = 'chart-line-down'; // Default to blue (down)
    if (historicalData.length >= 2) {
        const lastPrice = historicalData[historicalData.length - 1];
        const secondToLastPrice = historicalData[historicalData.length - 2];
        if (lastPrice > secondToLastPrice) {
            overallClassName = 'chart-line-up'; // Red (up)
        }
    }

    return (
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="chart-svg" aria-label="최근 10일간의 주가 변동 차트">
            {/* Y-Axis Labels and Grid Lines */}
            <g className="y-axis">
                {yAxisLabels.map(({ price, y }) => (
                    <g key={price}>
                        <text x={padding.left - 10} y={y} dy="0.32em" textAnchor="end" className="axis-label">
                            {Math.round(price).toLocaleString()}
                        </text>
                    </g>
                ))}
            </g>
            
            {/* Price Line Segments */}
            {historicalData.slice(1).map((price, index) => {
                const prevPrice = historicalData[index];
                const x1 = xScale(index);
                const y1 = yScale(prevPrice);
                const x2 = xScale(index + 1);
                const y2 = yScale(price);

                return (
                    <line
                        key={index}
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        className={overallClassName}
                        strokeWidth="2"
                    />
                );
            })}
            
             {/* Average Price Line */}
             {avgPriceY !== null && averagePrice && (
                <g>
                    <line
                        x1={padding.left}
                        y1={avgPriceY}
                        x2={svgWidth - padding.right}
                        y2={avgPriceY}
                        className="avg-price-line"
                    />
                     <text x={padding.left} y={avgPriceY - 5} className="avg-price-label" fill="#666">
                        평단가
                    </text>
                </g>
            )}
        </svg>
    );
};

export default StockChart;
