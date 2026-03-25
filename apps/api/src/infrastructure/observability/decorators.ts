import pino from "pino";

const log = pino({ level: process.env.LOG_LEVEL || "info" });

interface LogOptions {
  /** Log method arguments (default: true). Set false for sensitive data like passwords. */
  logArgs?: boolean;
  /** Log return value (default: false). Set true for debugging. */
  logResult?: boolean;
}

/**
 * Method decorator for structured logging on controllers and use-cases.
 *
 * Usage:
 *   @Log()
 *   async execute(request: CreateOrderRequest) { ... }
 *
 *   @Log({ logArgs: false })
 *   async login(request: LoginRequest) { ... }
 */
export function Log(options: LogOptions = {}): MethodDecorator {
  const { logArgs = true, logResult = false } = options;

  return function (
    _target: object,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ) {
    const original = descriptor.value;
    const methodName = String(propertyKey);

    descriptor.value = async function (this: object, ...args: unknown[]) {
      const className = this.constructor.name;
      const label = `${className}.${methodName}`;
      const start = performance.now();

      const logContext: Record<string, unknown> = {
        class: className,
        method: methodName,
      };

      if (logArgs && args.length > 0) {
        logContext.args = args[0];
      }

      log.info(logContext, `→ ${label}`);

      try {
        const result = await original.apply(this, args);
        const duration = Math.round(performance.now() - start);

        log.info(
          {
            class: className,
            method: methodName,
            duration,
            ...(logResult ? { result } : {}),
          },
          `✓ ${label} (${duration}ms)`
        );

        return result;
      } catch (error) {
        const duration = Math.round(performance.now() - start);

        log.error(
          { class: className, method: methodName, duration, err: error },
          `✗ ${label} (${duration}ms)`
        );

        throw error;
      }
    };

    return descriptor;
  };
}
