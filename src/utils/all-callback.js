
module.exports = allCallback;
function allCallback(state) {
	if (state instanceof Function) {
		state = { onFinish: state };
	}
	state._pending = 0;
	return item;
	function defaultReduce() {
		if (0 === this._pending) return this;
	}
	function item(ref) {
		state._pending++;
		if (state.onAdd instanceof Function) {
			ref = state.onAdd.apply(state, arguments);
		}
		return done;
		function done() {
			state._pending--;
			if (ref instanceof Function) {
				ref = ref.apply(state, arguments);
			}
			if (state.onDone instanceof Function) {
				state._current = ref;
				ref = state.onDone.apply(state, arguments);
			}
			var reduce = state.onReduce || defaultReduce;
			ref = reduce.call(state, ref);
			if (ref) state.onFinish.call(state, ref);
		}
	}
}
