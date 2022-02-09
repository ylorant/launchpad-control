class Module
{
    constructor(moduleManager)
    {
        this.manager = moduleManager;
    }

    init(moduleConfig)
    {
    }

    shutdown()
    {
    }

    static getConfiguration()
    {
        return {};
    }
}

module.exports = Module;