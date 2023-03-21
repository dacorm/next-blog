---
title: "SEO оптимизация React приложения"
subtitle: "Нестандартная проблема, такое же решение"
date: "2023-03-21"
---

SEO оптимизация в веб-приложениях присутствует в 80% случаев. Скорее всего если вам пришлось работать с SEO в реакте - решение вашей проблемы - Next.js 

## Проблема

> !DISLAIMER! То, что я показываю - по сути костыль. Намного проще просто начинать писать приложение сразу на Next.js если вам нужна SEO оптимизация, если она пригодилась вам в ходе разработки можно даже переписать приложение. Данной статьей я хочу показать не идеальное решение проблемы СЕО оптимизации Реакт приложения - а мое решение. Стоит понимать что не все проблемы в работе разработчика решаются легко и очевидно, стоит всегда смотреть широко и искать нетривиальные решения, об этом сегодня и поговорим

Приложение из примера - по сути просто новостной сайт, новости по Dota2, отбросив основной функционал будем думать что на сайте просто отображается список новостей Dota2 который подтягивается с бекенда

![Пример приложения](https://i.imgur.com/h6ERWCe.png)

Что нам нужно сделать для грамотной сео оптимизации:
1. Title и Description каждой страницы 
2. Карту сайта, чтобы роботы видели какие url будут на нашем сайте

### Решение проблемы с Title и Description

Title и Description - это мета теги которые должны отображать на каждой странице свои для того чтобы страница индексировалась роботами

Чтобы прокинуть их в Реакт проект нужно подключить библиотеку react-helmet-async

![helmet](https://i.imgur.com/rgtfrPK.png)

Я создал компонент Layout который будет оборачивать каждую страницу в переиспользуемые компоненты footer, header и прокидывать туда Мета Теги чтобы не делать это на каждой странице, следуя DRY паттерну

![layout](https://i.imgur.com/86Odt8Z.png)

Примерно так выглядит использование Layout компонента и прокидывание туда мета тегов

![meta](https://i.imgur.com/NEhCzZw.png)

Вот так выглядят мета теги в коде компонента, на каждой странице генерируются свои и подхватываются роботами, все супер

## Карта сайта

Это самая сложная часть сео оптимизации Реакт приложения. Заказчик попросил чтобы у него по адресу

https://sitename.ru/sitemap.xml

была доступна карта сайта, которую будут кушать роботы и понимать какой контент по каким урлам у нас есть на сайте, проблема в том что контент генерируется динамически, и мне нужно как-то собрать эту инфу и сгенерировать xml файл

В внедрении метатегов есть библиотеки типо react-helmet-async, в данном вопросе я не нашел актуальной библиотеки для 18ого реакта, пришлось думать самому, мое решение было такое

1. Я создал скрипт который будет работать postbuild, исполняться в среде node.js и генерировать в dist папку файл с названием sitemap.xml

Вот как выглядел примерный код скрипта 

```JavaScript
const { writeFileSync } = require('fs');
// подключаем prettier чтобы форматировать файл и не было проблем с кодировкой
const prettier = require('prettier');
// Подключаем библиотеку axios потому что в node.js не доступен fetch api
const axios = require('axios');

const unixTimeStampConverter = (unix) => {
    const miliseconds = unix * 1000;
    return String(new Date(miliseconds).getDate());
};

// Запрашиваем те самые посты которые являются динамическими урлами на нашем сайте
const getPosts = async () => {
    const { data } = await axios.get('https://posts.url/posts');
    return data;
};

// Создаем шаблон для динамического поста
const createPostTemplate = (lastmod, url) => `<url>
            <loc>https://sitename.url/article/${url}</loc>
            <lastmod>${lastmod}</lastmod>
            <changefreq>daily</changefreq>
            <priority>1.0</priority>
        </url>`;

async function generate() {
    const getDate = () => {
        const day = unixTimeStampConverter(Date.now());
        const formattedDay = Number(day) > 10 ? day : `0${day}`;
        const month = new Date().getMonth();
        const formattedMonth = Number(month) > 10 ? Number(month) + 1 : `0${Number(month) + 1}`;
        return `2023-${formattedMonth}-${formattedDay}`;
    };

    const date = getDate();

    const posts = await getPosts();
    const templates = [];

    // Создаем массив из шаблонов поста, который ниже развернем в шаблон карты сайта
    const formatTemplates = posts.length
        ? posts.forEach((post) => templates.push(createPostTemplate(post.updatedAt.slice(0, 10), `${post._id}-${translit(post.title)}`)))
        : '';

    // Сама карта сайта, статические урлы можно просто прописать подряд хардкодом, динамические генерируем на основе шаблонов
    const sitemap = `
    <?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
       <url>
            <loc>https://sitename.url/</loc>
            <lastmod>${date}</lastmod>
            <changefreq>daily</changefreq>
            <priority>1.0</priority>
        </url>
       <url>
            <loc>https://sitename.url/staticroute1</loc>
            <lastmod>${date}</lastmod>
            <changefreq>daily</changefreq>
            <priority>0.8</priority>
        </url>
       <url>
            <loc>https://sitename.url/staticroute2</loc>
            <lastmod>${date}</lastmod>
            <changefreq>daily</changefreq>
            <priority>0.8</priority>
        </url>
        ${templates.join(' ')}
    </urlset>
    `;

    // Обязательно форматируем, иначе будут проблемы с кодировкой
    const formatted = prettier.format(sitemap, { semi: false, parser: 'html' });

    // Сохраняем в папку build либо dist
    writeFileSync('build/sitemap.xml', formatted);
}

generate();
```

![script](https://i.imgur.com/dY99IQC.png)

Обязательно создаем postbuild script, он будет автоматически запускаться после билда
Если все сделано верно, в папке build появится файл sitemap.xml

на сайте по запросу url/sitemap.xml будет появляться примерно вот такое

![sitemap](https://i.imgur.com/2TEfCVk.png)

Это значит что вы все сделали правильно, можно отправлять вашу карту сайта роботам, а ваш проект оптимизирован для SEO на 100%

Не существует нерешаемых проблем в программировании, главное смотрите на вопрос шире и все получится. Практически нигде я не нашел гайдов как сделать sitemap для React приложения, но посмотрел на проблему шире, изучил что есть postbuild script и понял, как можно это реализовать, всегда рассматривайте проблему с разных сторон, так победим.

