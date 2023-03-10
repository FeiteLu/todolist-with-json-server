//console.log("hello world")

/* 
  client side
    template: static template
    logic(js): MVC(model, view, controller): used to server side technology, single page application
        model: prepare/manage data,
        view: manage view(DOM),
        controller: business logic, event bindind/handling

  server side
    json-server
    CRUD: create(post), read(get), update(put, patch), delete(delete)


*/

//read
/* fetch("http://localhost:3000/todos")
    .then((res) => res.json())
    .then((data) => {
        console.log(data);
    }); */


function myFetch(url, method, body = '', headers = '') {

    const xhr = new XMLHttpRequest();
    return new Promise((resolve, reject) => {
        switch (method) {
            case "GET":
                xhr.open("GET", url);
                xhr.responseType = 'json';
                xhr.onreadystatechange = function () {
                    if (this.readyState == 4 && this.status == 200) {
                        // Typical action to be performed when the document is ready:
                        resolve(xhr.response);

                    }
                };

                xhr.send();
                break;



            case "POST":
                xhr.open("POST", url, true);
                xhr.setRequestHeader(Object.keys(headers)[0], Object.values(headers)[0]);
                xhr.responseType = 'json';
                xhr.onreadystatechange = function () {
                    if (this.readyState == 4 && this.status == 200) {
                        // Typical action to be performed when the document is ready:
                        resolve(xhr.response);

                    }
                };

                xhr.send(body);

                break;


            case "DELETE":
                xhr.open("DELETE", url, true);
                xhr.responseType = 'json';
                xhr.onreadystatechange = function () {
                    if (this.readyState == 4 && this.status == 200) {
                        // Typical action to be performed when the document is ready:
                        resolve(xhr.response);
                    }
                };

                xhr.send();

                break;

            case "PATCH":
                xhr.open("PATCH", url, true);
                xhr.setRequestHeader(Object.keys(headers)[0], Object.values(headers)[0]);
                xhr.responseType = 'json';
                xhr.onreadystatechange = function () {
                    if (this.readyState == 4 && this.status == 200) {
                        // Typical action to be performed when the document is ready:
                        resolve(xhr.response);

                    }
                };

                xhr.send(body);

                break;


            default:
                xhr.open("GET", url);
                xhr.responseType = 'json';
                xhr.onreadystatechange = function () {
                    if (this.readyState == 4 && this.status == 200) {
                        // Typical action to be performed when the document is ready:
                        resolve(xhr.response);
                    }
                };

                xhr.send();

                break;


        }
    })




}

const APIs = (() => {
    const createTodo = (newTodo) => {
        return myFetch("http://localhost:3000/todos", "POST", JSON.stringify(newTodo), { "Content-Type": "application/json" })
            .then((res) => res);


    };

    const deleteTodo = (id) => {
        // return fetch("http://localhost:3000/todos/" + id, {
        //     method: "DELETE",
        // }).then((res) => res.json());
        return myFetch("http://localhost:3000/todos/" + id, "DELETE")
            .then((res) => res);

    };

    const getTodos = () => {
        return myFetch("http://localhost:3000/todos", "GET").then((res) => res);

    };

    const updateTodo = (newTodo, id) => {
        return myFetch("http://localhost:3000/todos/" + id, "PATCH", JSON.stringify(newTodo), { "Content-Type": "application/json" })
            .then((res) => res);
    }
    return { createTodo, deleteTodo, getTodos, updateTodo };
})();

//IIFE
//todos
/* 
    hashMap: faster to search
    array: easier to iterate, has order


*/
const Model = (() => {
    class State {
        #todos; //private field
        #onChange; //function, will be called when setter function todos is called
        constructor() {
            this.#todos = [];
        }
        get todos() {
            return this.#todos;
        }
        set todos(newTodos) {
            // reassign value
            // console.log("setter function");
            this.#todos = newTodos;
            this.#onChange?.(); // rendering
        }

        subscribe(callback) {
            //subscribe to the change of the state todos
            this.#onChange = callback;
        }
    }
    const { getTodos, createTodo, deleteTodo, updateTodo } = APIs;
    return {
        State,
        getTodos,
        createTodo,
        deleteTodo,
        updateTodo
    };
})();
/* 
    todos = [
        {
            id:1,
            content:"eat lunch"
        },
        {
            id:2,
            content:"eat breakfast"
        }
    ]

*/
const View = (() => {
    const pendingEl = document.querySelector(".pending-tasks");
    const completedEl = document.querySelector(".completed-tasks")
    const submitBtnEl = document.querySelector(".submit-btn");
    const editBtnEl = document.querySelector(".edit-btn");
    const moveBtnEl = document.querySelector(".move-btn");
    const inputEl = document.querySelector(".input");

    const renderTodos = (todos) => {
        let todosPending = "";
        let todosCompleted = ""

        const todosP = todos.filter((todo) => {
            return !todo.completed;
        });
        const todosC = todos.filter((todo) => {
            return todo.completed;
        });

        todosP.forEach((todo) => {
            let liTemplate = `<li><span>${todo.content}</span>
            <button class="edit-btn" id="${todo.id}">edit</button>
            <button class="delete-btn" id="${todo.id}">delete</button>
            <button class="move-btn" id="${todo.id}">move</button>
            </li>`;
            todosPending += liTemplate;

        });
        todosC.forEach((todo) => {
            let liTemplate = `<li><span>${todo.content}</span>
            <button class="edit-btn" id="${todo.id}">edit</button>
            <button class="delete-btn" id="${todo.id}">delete</button>
            <button class="move-btn" id="${todo.id}">move</button>
            </li>`;
            todosCompleted += liTemplate;

        });
        if (todosP.length === 0) {
            todosPending = "<h4>no task to display!</h4>";

        }
        if (todosC.length === 0) {
            todosCompleted = "<h4>no task to display!</h4>";
        }

        pendingEl.innerHTML = todosPending;
        completedEl.innerHTML = todosCompleted;
    };

    const clearInput = () => {
        inputEl.value = "";
    };

    return { renderTodos, submitBtnEl, inputEl, clearInput, pendingEl };
})();

const Controller = ((view, model) => {
    const state = new model.State();
    const init = () => {
        model.getTodos().then((todos) => {
            todos.reverse();
            state.todos = todos;
        });
    };

    const handleSubmit = () => {
        view.submitBtnEl.addEventListener("click", (event) => {
            /* 
                1. read the value from input
                2. post request
                3. update view
            */
            const inputValue = view.inputEl.value;
            model.createTodo({ content: inputValue, pending: true }).then((data) => {
                state.todos = [data, ...state.todos];
                view.clearInput();
            });
        });
    };

    const handleEdit = () => {
        view.pendingEl.addEventListener("click", (event) => {
            if (event.target.className === "edit-btn") {
                const id = event.target.id;


            }
        })
    }

    const handleMove = () => {

    }

    const handleDelete = () => {
        //event bubbling
        /* 
            1. get id
            2. make delete request
            3. update view, remove
        */
        view.pendingEl.addEventListener("click", (event) => {
            if (event.target.className === "delete-btn") {
                const id = event.target.id;
                console.log("id", typeof id);
                model.deleteTodo(+id).then((data) => {
                    state.todos = state.todos.filter((todo) => todo.id !== +id);
                });
            }
        });
    };

    const bootstrap = () => {
        init();
        handleSubmit();
        handleDelete();
        state.subscribe(() => {
            view.renderTodos(state.todos);
        });
    };
    return {
        bootstrap,
    };
})(View, Model); //ViewModel

Controller.bootstrap();
