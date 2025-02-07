import { BaseManager } from './baseManager';
import {
    animate as baseAnimate,
    AnimationControls,
    AnimationOptions as BaseAnimationOptions,
    Driver,
    tween,
    TweenControls,
    TweenOptions,
} from '../../motion/animate';

type AnimationId = string;
type AnimationEventType = 'animation-frame';

interface AnimationEvent<AnimationEventType> {
    type: AnimationEventType;
    delta: number;
}

interface AnimationOptions<T> extends Omit<BaseAnimationOptions<T>, 'driver'> {}

interface AnimationManyOptions<T> extends Omit<AnimationOptions<T>, 'from' | 'to' | 'onUpdate'> {
    onUpdate: (props: Array<T>) => void;
}

const DEBOUNCE_DELAY = 300;

export class AnimationManager extends BaseManager<AnimationEventType, AnimationEvent<AnimationEventType>> {
    private readonly controllers: Record<AnimationId, AnimationControls> = {};
    private debouncers: Record<AnimationId, number> = {};

    private updaters: Array<[AnimationId, FrameRequestCallback]> = [];

    private isPlaying = false;
    private requestId?: number;
    private lastTime?: number;
    private readyToPlay = false;

    public skipAnimations = false;

    constructor() {
        super();

        window.addEventListener('DOMContentLoaded', () => {
            this.readyToPlay = true;
        });
    }

    public play() {
        if (this.isPlaying) return;

        this.isPlaying = true;

        for (const id in this.controllers) {
            this.controllers[id].play();
        }

        this.startAnimationCycle();
    }

    public pause() {
        if (!this.isPlaying) return;

        this.isPlaying = false;
        this.cancelAnimationFrame();

        for (const id in this.controllers) {
            this.controllers[id].pause();
        }
    }

    public stop() {
        this.isPlaying = false;
        this.cancelAnimationFrame();

        for (const id in this.controllers) {
            this.controllers[id].stop();
        }
    }

    public animate<T>(id: AnimationId, opts: AnimationOptions<T>): AnimationControls {
        const optsExtra = {
            ...opts,
            autoplay: this.isPlaying ? opts.autoplay : false,
            driver: this.createDriver(id),
        };
        const controller = baseAnimate(optsExtra);

        if (this.controllers[id]) {
            this.controllers[id].stop();
            delete this.controllers[id];
        }

        this.controllers[id] = controller;

        if (this.skipAnimations) {
            // Initialise the animation with the final values immediately and then stop the animation
            opts.onUpdate?.(opts.to);
            controller.stop();
        } else {
            // Initialise the animation immediately without requesting a frame to prevent flashes
            opts.onUpdate?.(opts.from);
        }

        return controller;
    }

    public animateMany<T>(
        id: AnimationId,
        props: Array<Pick<AnimationOptions<T>, 'from' | 'to'>>,
        opts: AnimationManyOptions<T>
    ): AnimationControls {
        const state = props.map((prop) => prop.from);

        let updateBatch = 0;

        const onUpdate = (index: number) => (v: T) => {
            state[index] = v;
            if (++updateBatch >= props.length) {
                opts.onUpdate?.(state);
                updateBatch = 0;
            }
        };

        const drivers = props.map((prop, index) => {
            const inner_id = `${id}-${index}`;
            return this.animate(inner_id, { ...opts, ...prop, onUpdate: onUpdate(index) });
        });

        const controls = {
            get isPlaying() {
                return drivers.some((driver) => driver.isPlaying);
            },
            play() {
                drivers.forEach((driver) => driver.play());
                return controls;
            },
            pause() {
                drivers.forEach((driver) => driver.pause());
                return controls;
            },
            stop() {
                drivers.forEach((driver) => driver.stop());
                return controls;
            },
            reset() {
                drivers.forEach((driver) => driver.reset());
                return controls;
            },
        };

        return controls;
    }

    public debouncedAnimate<T>(id: AnimationId, opts: AnimationOptions<T>): AnimationControls {
        if (this.debouncers[id] && Date.now() - this.debouncers[id] < (opts.duration ?? DEBOUNCE_DELAY)) {
            return this.controllers[id];
        }

        this.debouncers[id] = Date.now();
        return this.animate(id, opts);
    }

    public tween<T>(opts: TweenOptions<T>): TweenControls<T> {
        const id = `tween-${btoa(JSON.stringify(opts))}`;
        const optsExtra = {
            ...opts,
            driver: this.createDriver(id),
        };

        return tween(optsExtra);
    }

    private createDriver(id: AnimationId): Driver {
        return (update: (time: number) => void) => {
            return {
                start: () => {
                    this.updaters.push([id, update]);
                },
                stop: () => {
                    this.updaters = this.updaters.filter(([uid]) => uid !== id);
                },
                reset: () => {},
            };
        };
    }

    private startAnimationCycle() {
        const frame = (time: number) => {
            if (!this.readyToPlay) {
                this.requestId = requestAnimationFrame(frame);
                return;
            }

            if (this.lastTime === undefined) this.lastTime = time;
            const delta = time - this.lastTime;
            this.lastTime = time;

            this.updaters.forEach(([_, update]) => {
                update(delta);
            });

            this.listeners.dispatch('animation-frame', { type: 'animation-frame', delta });

            this.requestId = requestAnimationFrame(frame);
        };

        this.requestId = requestAnimationFrame(frame);
    }

    private cancelAnimationFrame() {
        if (!this.requestId) return;

        cancelAnimationFrame(this.requestId);
        this.requestId = undefined;
    }
}
