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

    getConfiguration()
    {
        return {};
    }
}

module.exports = Module;