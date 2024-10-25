/** The object contains all runtime environment variables in application */
export interface RuntimeEnv {
    /** Contains runtime application variables */
    app: {
        /** Application title will displayed in browser tab  */
        title: string
    }

    /** Contains all api's urls using in this applications */
    api: {
        solution: string
    }
}
