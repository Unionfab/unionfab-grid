<framework-specific-section frameworks="vue">
Below is a simple example of cell editor component:

<snippet transform={false}>
|const DoublingEditor = {
|    template: `<input type="number" v-model="value" ref="input" style="width: 100%" />`,
|    data() {
|        return {
|            value: null
|        };
|    },
|    methods: {
|        /* Component Editor Lifecycle methods */
|        // the final value to send to the grid, on completion of editing
|        getValue() {
|            // this simple editor doubles any value entered into the input
|            return this.value * 2;
|        },
|
|        // Gets called once before editing starts, to give editor a chance to
|        // cancel the editing before it even starts.
|        isCancelBeforeStart() {
|            return false;
|        },
|
|        // Gets called once when editing is finished (eg if Enter is pressed).
|        // If you return true, then the result of the edit will be ignored.
|        isCancelAfterEnd() {
|            // our editor will reject any value greater than 1000
|            return this.value > 1000;
|        }
|    },
|    mounted() {
|        this.value = this.params.value;
|        Vue.nextTick(() => this.$refs.input.focus());
|    }
|}
</snippet>

And here is the same cell editor using Vue 3's Composition API:

<snippet transform={false}>
|export default {
|     template: `<input type="number" v-model="value" ref="input" style="width: 100%"/>`,
|     setup(props) {
|         // the current/initial value of the cell (before editing)
|         const value = ref(props.params.value);
| 
|         /* Component Editor Lifecycle methods */
|         // the final value to send to the grid, on completion of editing
|         const getValue = () => {
|             // this simple editor doubles any value entered into the input
|             return value.value * 2;
|         };
| 
|         // Gets called once before editing starts, to give editor a chance to
|         // cancel the editing before it even starts.
|         const isCancelBeforeStart = () => {
|             return false;
|         };
| 
|         // Gets called once when editing is finished (eg if Enter is pressed).
|         // If you return true, then the result of the edit will be ignored.
|         const isCancelAfterEnd = () => {
|             // our editor will reject any value greater than 1000
|             return value.value > 1000;
|         };
| 
|         return {
|             value,
|             getValue,
|             isCancelBeforeStart,
|             isCancelAfterEnd
|         }
|     },
|     mounted() {
|         // focus on the input field once editing starts
|         nextTick(() => this.$refs.input.focus());
|     }
| };
</snippet>
</framework-specific-section>