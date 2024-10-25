import type { RuntimeEnv } from 'runtime/RuntimeEnv'

// Declare the RUNTIME_ENV as the property of window object.
declare global {
    interface Window {
        RUNTIME_ENV: RuntimeEnv
    }
}
