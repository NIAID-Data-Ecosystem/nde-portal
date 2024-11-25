import React, { useState } from 'react';
import { Zoom } from '@visx/zoom';
import { localPoint } from '@visx/event';
import { RectClipPath } from '@visx/clip-path';
import { TransformMatrix } from '@visx/zoom/lib/types';
import { Box } from '@chakra-ui/react';

const initialTransformDefault = {
  scaleX: 1,
  scaleY: 1,
  translateX: 0,
  translateY: 0,
  skewX: 0,
  skewY: 0,
};

export interface ZoomProps {
  width: number;
  height: number;
  children: React.ReactNode;
  includeMiniMap?: boolean;
  bg?: string;
  initialTransform?: TransformMatrix;
}

export const ZoomContainer = ({
  width,
  height,
  children,
  includeMiniMap = false,
  bg = '#0a0a0a',
  initialTransform = initialTransformDefault,
}: ZoomProps) => {
  const [showMiniMap, setShowMiniMap] = useState<boolean>(includeMiniMap);
  return (
    <>
      <Zoom<SVGSVGElement>
        width={width * 2}
        height={height * 2}
        // scaleXMin={1 / 2}
        // scaleXMax={4}
        // scaleYMin={1 / 2}
        // scaleYMax={4}
        initialTransformMatrix={initialTransform}
      >
        {zoom => {
          return (
            <div className='relative'>
              <svg
                width={width}
                height={height}
                style={{
                  cursor: zoom.isDragging ? 'grabbing' : 'grab',
                  touchAction: 'none',
                }}
                ref={zoom.containerRef}
              >
                <RectClipPath id='zoom-clip' width={width} height={height} />
                <rect width={width} height={height} rx={14} fill={bg} />
                <g transform={zoom.toString()}>{children}</g>
                {/* <rect
                  width={width}
                  height={height}
                  rx={14}
                  fill='transparent'
                  onTouchStart={zoom.dragStart}
                  onTouchMove={zoom.dragMove}
                  onTouchEnd={zoom.dragEnd}
                  onMouseDown={zoom.dragStart}
                  onMouseMove={zoom.dragMove}
                  onMouseUp={zoom.dragEnd}
                  onMouseLeave={() => {
                    if (zoom.isDragging) zoom.dragEnd();
                  }}
                  onDoubleClick={event => {
                    const point = localPoint(event) || { x: 0, y: 0 };
                    zoom.scale({ scaleX: 1.1, scaleY: 1.1, point });
                  }}
                /> */}
                {includeMiniMap && showMiniMap && (
                  <g
                    clipPath='url(#zoom-clip)'
                    transform={`
                    scale(0.25)
                    translate(${width * 4 - width - 60}, ${
                      height * 4 - height - 60
                    })
                  `}
                  >
                    <rect width={width} height={height} fill='#1a1a1a' />
                    {children}

                    <rect
                      width={width}
                      height={height}
                      fill='white'
                      fillOpacity={0.2}
                      stroke='white'
                      strokeWidth={4}
                      transform={zoom.toStringInvert()}
                    />
                  </g>
                )}
              </svg>
              <div className='controls'>
                <button
                  type='button'
                  className='btn btn-zoom'
                  onClick={() => zoom.scale({ scaleX: 1.2, scaleY: 1.2 })}
                >
                  +
                </button>
                <button
                  type='button'
                  className='btn btn-zoom btn-bottom'
                  onClick={() => zoom.scale({ scaleX: 0.8, scaleY: 0.8 })}
                >
                  -
                </button>
                <button
                  type='button'
                  className='btn btn-lg'
                  onClick={zoom.center}
                >
                  Center
                </button>
                <button
                  type='button'
                  className='btn btn-lg'
                  onClick={zoom.reset}
                >
                  Reset
                </button>
                {/* <button
                  type='button'
                  className='btn btn-lg'
                  onClick={zoom.clear}
                >
                  Clear
                </button> */}
              </div>
              {includeMiniMap && (
                <div className='mini-map'>
                  <button
                    type='button'
                    className='btn btn-lg'
                    onClick={() => setShowMiniMap(!showMiniMap)}
                  >
                    {showMiniMap ? 'Hide' : 'Show'} Mini Map
                  </button>
                </div>
              )}
            </div>
          );
        }}
      </Zoom>

      <style jsx>{`
        .btn {
          margin: 0;
          text-align: center;
          border: none;
          background: #2f2f2f;
          color: #999;
          padding: 0 4px;
          border-top: 1px solid #0a0a0a;
        }
        .btn-lg {
          font-size: 12px;
          line-height: 1;
          padding: 4px;
        }
        .btn-zoom {
          width: 26px;
          font-size: 22px;
        }
        .btn-bottom {
          margin-bottom: 1rem;
        }

        .controls {
          position: absolute;
          top: 15px;
          right: 15px;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }
        .mini-map {
          position: absolute;
          bottom: 25px;
          right: 15px;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }
        .relative {
          position: relative;
          width: ${width}px;
          height: ${height}px;
        }
      `}</style>
    </>
  );
};
