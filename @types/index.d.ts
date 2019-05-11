/**
 * interface for Sketch
 */
exports = jsketch;
export as namespace jsketch;

declare function jsketch(definition:jsketch.SketchDefinition, dropZone: HTMLElement): jsketch.SketchInstance;

declare module jsketch {
    interface SketchDefinition {
        height: number;
        width: number;
        name?: string;
        id: string;
    }

    interface SketchInstance {
        canvas: HTMLCanvasElement;
        ctx: CanvasRenderingContext2D;
        addColor(color:string): this;
        addEventListener(events: Array<string>, handler: function): this;
        addStyle(styles: any): this;
        erase(): void;
        $on(eventName: string, handler: function): this;
        getDataURL(callback: function): void;
        init(callback: function): this;
        interact(): jsketch.InterractionInstance;
        reScale(definition: {width:number|string, height:number|string}): void;
        setColor(color:string): this;
        setPenSize(size: string): void;
        trigger(eventName: string, arg: Array<any>): this;
    }

    interface InterractionInstance {
        $on(eventName: string, handler: function): this;
        trigger(eventName: string, arg: Array<any>): this;
        draw(obj: drawInstance):void;
        getEvents():void;
        watch(): this;
        sendEvent(eventName: string, stack: drawInstance.stack):void;
        connect():this;
        destroyFrame(frameId: string):void;
    }

    interface drawInstance {
        user: string;
        stack: Arrav<{
            event: string;
            arg:Array<any>;
        }>;
    }
}