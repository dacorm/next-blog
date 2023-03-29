---
title: "Пишем свой шаблонизатор DOM"
subtitle: "Пишем свой шаблонизатор чтобы на основе него сделать фреймворк :)"
date: "2023-03-20"
---

В продолжение статьи о оптимизации DOM операций я бы хотел написать свой мини фреймворк. В ходе написания мы реализуем
1. Свой шаблонизатор
2. Паттерн subscriber
3. Свой фреймворк с методами жизненного цикла
4. Свой стейт менеджер
5. Возможно сделаем роутер самописный

Все это поможет нам лучше понять устройство этих вещей под капотом. В ходе написания будем широко использовать ООП паттерн.
А в конце мы сделаем небольшой замер скорости работы нашего фреймворка и React.

## Зачем?

Зачем писать свой шаблонизатор - очевидный вопрос который вытекает из темы данного поста

Наше приложение будет - обычный список задач без замудренного функционала, просто чтобы показать как работает фреймворк под капотом. Хотя на том "фреймворке" что мы будем писать можно делать и более сложные вещи

Мы конечно можем рендерить наш список задач в формате

```html
<div class="todo__wrapper">
    <div class="todo__button">
        <input type="text" class="todo__input" oninput="changeHandler()">
        <button class="button" onclick="clickHandler()" type="button">
            <span>Добавить задачу</span>
        </button>
    </div>
    <ul class="todo__list">
        <li class="todo__item">Задача 1</li>
        <li class="todo__item">Задача 2</li>
        <li class="todo__item">Задача 3</li>
    </ul>
</div>
```

Все классно работает, нет никаких проблем, кроме того что это статика, а если мы хотим рендерить список задач динамически, так же как классы - это уже нужно будет придумывать какую-то функцию, вешать слушатель и так далее.
А так же между этим не забывать об оптимизации рендеринга и общего перфоманса.

В jsx, который по сути своей тоже шаблонизатор,  мы могли бы сделать так

```jsx
    <ul class="todo__list">
        {todos.map(todo => (<li className={'todo__item'}>{todo.text}</li>))}
    </ul>
```
И в таком случае наши тудушки будут рендериться динамически реактивно, я хочу сделать что-то похожее.

### Имплементация

Я буду хранить шаблон в файле todoList.tmpl.ts, выглядить он будет так

```js
export const template = `
<div class="{{ wrapperClassName }}">
  <div class="chat__button">
    <input type="text" class="{{ inputClassName }}" oninput="{{ changeHandler }}">
    <button class="button" onclick="{{ handleClick }}" type="button">
      <span>{{ buttonText }}</span>
    </button>
  </div>
  <ul class="{{ chatListClassName }}">
    {{ chatListItems }}
  </ul>
</div>
`;
```

Теперь нам нужно сделать класс шаблонизатора, который будет 
1. Принимать строку
2. Распознавать все элементы которые заключены в {{}}
3. Создавать массив этих элементов
4. Иметь метод compile, который будет принимать обьект, где будут ключи идентичные элементам массива созданного в п3
5. Метод compile будет брать обьект который передан в него (назовем обьект ctx от слова context)
6. И обращаться по ключу, забирая ключ у элемента массива
7. Далее полученное значение методом replace мы будем вставлять в полученную на вход в класс шаблонную строку
8. В итоге метод отдает шаблонную строку где значения заменены на динамические

## Реализация в коде

```ts
type funcType = () => void;
type keyType = string | any[] | funcType

class Templator {
  private _template: string;
  constructor(template: string) {
      this._template = template;
  }

  compile(ctx: Record<string, keyType>) {
      const templateVariableRe = /\{\{(.*?)\}\}/g;
      let match = null;
      let result = this._template;

      while (match = templateVariableRe.exec(this._template)) {
          const variableName = match[1] && match[1].trim();
          if (!variableName) {
              continue;
          }

          const data = ctx[variableName];

          result = result.replace(new RegExp(match[0], 'gi'), data as string);
      }

      return result;
  }
}
```

Вот так выглядит начальная версия нашего шаблонизатора, мы просто регулярным выражением фильтруем строку которую отправили, потом находим в обьекте ctx такую переменную и заменяем в итоговой строке значением из обьекта шаблон

Допишем еще пару моментов в реализации

Сначала сделаем внешний удобный api

```ts
export const compile = (template: string, props: Record<string, keyType>) => {
  const templator = new Templator(template);
  return templator.compile(props);
};
```

С использованием этой функции можно удобно компилировать строку
Далее 

```ts
export const todoTemplate = `
<div class="{{ wrapperClassName }}">
  <div class="chat__button">
    <input type="text" class="{{ inputClassName }}" oninput="{{ changeHandler }}">
    <button class="button" onclick="{{ handleClick }}" type="button">
      <span>{{ buttonText }}</span>
    </button>
  </div>
  <ul class="{{ chatListClassName }}">
    {{ chatListItems }}
  </ul>
</div>
`;
```

```ts
const todos = [
    {
        text: 'Задача 1',
        isDone: false
    }, {
        text: 'Задача 2',
        isDone: false
    }, {
        text: 'Задача 3',
        isDone: false
    }, {
        text: 'Задача 4',
        isDone: false
    }, {
        text: 'Задача 5',
        isDone: false
    },
]

const app = document.querySelector('#app');

const todoList = compile(todoTemplate, {
  wrapperClassName: 'todo__wrapper',
    buttonText: 'Добавить задачу',
    chatListClassName: 'todo__list',
    inputClassName: 'todo__input',
    chatListItems: todos.map(item => (
        `<li class="todo__item">${item.text}</li>`
    ))
})

if (app) {
  app.innerHTML = todoList;
}
```

Чтобы было понятнее что тут происходит, я покажу консоль логи выполнения метода compile класса Templator, а потом итоговый результат 

![console](https://i.imgur.com/YzunJrB.png)

![result](https://i.imgur.com/w6Lw7AN.png)

В итоге получается вот так 

![ui](https://i.imgur.com/mXOUY8p.png)

Предлагаю сделать небольшую доработку чтобы не было запятых, появляются они потому что мы рендерим элементы массива, а там они идут через запятую 

После того как мы получаем переменную data в классе Templator, добавим такой код

```ts
if (Array.isArray(data)) {
    result = result.replace(new RegExp(match[0], 'gi'), join(data));
    continue
}
```

Теперь имплементируем функцию join где нибудь в папке utils 

```ts
function join(templates: string[]) {
  if (!Array.isArray(templates)) {
      throw new Error(`Функция join ожидает массив, был передан ${typeof templates}`);
  }
  return templates.join('');
}
```

TypeGuard в данном случае конечно же не обязателен
Теперь запятых не будет, но я хочу добавить слушатель события на кнопку

Делать мы это будем инлайново, типо

```html
<button class="button" onclick="{{ handleClick }}" type="button">
```

В таком случае handleClick должна именно записываться с круглыми скобками, типо onclick='handleClick()'

Мы не можем в html файл импортировать функцию, и если мы просто так ее напишем - не будет понятно откуда ее вызывать. 

Нам нужно "эмулировать" глобальную функцию, сначала записать ее в window по ключу [funcName]
А потом оттуда достать и сделать вот так

onclick='window.funcName()';

Добавим такую проверку 

```ts
if (typeof data === 'function') {
    window[variableName] = data;
    result = result.replace(new RegExp(match[0], 'gi'), `window.${variableName}()`);
    continue
}
```

И обязательно расширим тип window чтобы не было ts ошибок, в отдельном файле

```ts
export {}

declare global {
  interface Window {
      [key: string]: () => void;
  }
}
```
В обьект который вторым параметром передаем в compile добавим 

```ts
handleClick: () => {
    const todos = app && app.querySelector('.todo__list');
    if (todos) {
      todos.innerHTML += `<li class="todo__item">Задача</li>`;
    }
}
```
После всего этого у нас получается отрендеренный полностью список с рабочей кнопкой handleClick по клику на которую добавляется элемент с названием "Задача"

## Итог

В этой статьей я показал по сути первый шаг к тому чтобы реализовать свой фреймворк - написание удобного шаблонизатора для рендеринга динамического контента в DOM
Конечно, в нем еще есть над чем работать, но для нашей задачи он подойдет идеально. Если кому интересно - можете доработать, в конце написания цикла статей я дам ссылку на репозиторий с готовым фреймворком, можно будет поиграться и доработать

В следующей статье разберем паттерн subscriber на котором будем работать наш фреймворк.


