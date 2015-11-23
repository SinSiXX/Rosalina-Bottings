exports.displayError = function(err, back) {
    if(back === undefined) {back = 10;}
    if(err.stack !== undefined) {
        return err.stack.split("\n").slice(0, back).join("\n |");
    }
    else {
        return err;
    }
};