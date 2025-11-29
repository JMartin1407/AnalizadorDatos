
declare module "react-plotly.js" {
    import * as React from "react";

    interface PlotParams {
        data: any[];
        layout: any;
        config?: any;
        onInitialized?: (figure: any, graphDiv: any) => void;
        onUpdate?: (figure: any, graphDiv: any) => void;
        onPurge?: (graphDiv: any) => void;
        style?: React.CSSProperties;
        className?: string;
        useResizeHandler?: boolean;
        debug?: boolean;
    }

    export default class Plot extends React.Component<PlotParams> {}
}
