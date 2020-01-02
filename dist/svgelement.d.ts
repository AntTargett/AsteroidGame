import Observable from "./observable";
declare class Elem {
    elem: Element;
    constructor(svg: HTMLElement, tag: string, parent?: Element);
    attr(name: string): string;
    attr(name: string, value: string | number): this;
    observe<T extends Event>(event: string): Observable<T>;
}
export default Elem;
