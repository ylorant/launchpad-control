class Animation
{
    /**
     * AVAILABLE CONSTANTS:
     * 
     * Animation.FRAME_CLEAR: Clears the pad between each frame
     * Animation.FRAME_KEEP: Keeps the content of the pad between each frame
     */

    constructor(pad, refreshType, actions)
    {
        this.pad = pad;
        this.refreshType = refreshType;
        this.actions = actions;
        this.currentAction = 0;
        this.actionData = null;
        this.interval = null;
    }

    /**
     * Starts the animation.
     */
    start()
    {
        // 16ms frame length = 60 fps
        return new Promise(((resolve, reject) => {
            this.interval = setInterval(this.frame.bind(this, resolve, reject), 16);
        }).bind(this));
    }

    /**
     * Executes an animation frame
     */
    frame(resolve, reject)
    {
        // if we're on a new action, we initialize it
        if(this.actionData == null) {
            this.actionData = {};
            for(var i in this.actions[this.currentAction]) {
                this.actionData[i] = this.actions[this.currentAction][i].init(this.pad);
            }
        }

        if(this.refreshType == Animation.FRAME_CLEAR) {
            this.pad.allDark();
        }

        // Execute frame for each action
        for(var i in this.actions[this.currentAction]) {
            this.actionData[i] = this.actions[this.currentAction][i].frame(this.actionData[i]);
        }

        // Check that this action is done, where any one of its components is done
        var actionDone = false;

        for(var i in this.actions[this.currentAction]) {
            if(this.actions[this.currentAction][i].isDone(this.actionData[i])) {
                actionDone = true;
                break;
            }
        }

        if(actionDone) {
            this.actionData = null;
            this.currentAction++;

            // Check if there is no remaining action
            if(typeof this.actions[this.currentAction] == "object" && !(this.actions[this.currentAction] instanceof Array)) {
                var action = this.actions[this.currentAction];

                for(var key in action) {
                    switch(key) {
                        case "refreshType":
                            this.refreshType = action.refreshType;
                            break;

                        case "clear":
                            if(action.clear) {
                                this.pad.allDark();
                            }
                            break;
                    }
                }

                this.currentAction++;
            }

            if(typeof this.actions[this.currentAction] == "undefined") {
                clearInterval(this.interval);
                resolve();
            }
        }
    }
}

Object.defineProperty(Animation, 'FRAME_CLEAR', {
    value: 1,
    writable: false,
    configurable: false,
    enumerable: true,
});
Object.defineProperty(Animation, 'FRAME_KEEP', {
    value: 2,
    writable: false,
    configurable: false,
    enumerable: true,
});

module.exports = Animation;