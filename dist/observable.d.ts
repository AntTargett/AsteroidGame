interface Observer<Input> {
    next(value: Input): void;
    complete(): void;
    unsub?: () => void;
}
declare class Observable<Input> {
    private _subscribe;
    constructor(_subscribe: (_: Observer<Input>) => () => void);
    subscribe(next: (_: Input) => void, complete?: () => void): () => void;
    static fromEvent<E extends Event>(el: Node, name: string): Observable<E>;
    static fromArray<V>(arr: V[]): Observable<V>;
    static interval(milliseconds: number): Observable<number>;
    map<R>(transform: (_: Input) => R): Observable<R>;
    forEach(f: (_: Input) => void): Observable<Input>;
    filter(condition: (_: Input) => boolean): Observable<Input>;
    takeUntil<V>(o: Observable<V>): Observable<Input>;
    flatMap<Output>(streamCreator: (_: Input) => Observable<Output>): Observable<Output>;
    scan<V>(initialVal: V, fun: (a: V, el: Input) => V): Observable<V>;
}
export default Observable;
