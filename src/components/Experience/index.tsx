import { h } from 'preact';

export function Experience() {
    return (
        <div className="projects">
            <div className="projects-item">
                <div className="projects-dateContainer">
                    <span className="projects-date">10.2020</span>
                </div>
                <h3>
                    Тимлид фронтенд–команды в <a href="https://otr.ru/">ОТР</a>
                </h3>
                <p>Руковожу командой из 7 человек. Учусь выстраивать процессы так, чтобы люди не выгорали. Оптимизирую обмен информацией между бизнесом и разработкой. Ввел обязательное код ревью, сделал для этого систему.</p>
                <p>Помогаю девопсам строить CI/CD конвеер. Активно делюсь знаниями и предлагаю свои решения. Не боюсь спорить с архитектором и аналитиками.</p>
            </div>
            <div className="projects-item">
                <div className="projects-dateContainer">
                    <span className="projects-date">02.2019 — 10.2020</span>
                </div>
                <h3>
                    Фронтлид в <a href="https://tektosoft.ru/">Тектософт</a>
                </h3>
                <p>Отвечал за работу команды фронтендеров, выбирал стек технологий, и писад код. Реализовал CI/CD, рисовал
                    дизайн для ключевых проектов.</p>
                <p>В свободное время развлекался экспериментами с технологиями, которые можно внедрить в компанию.</p>
            </div>
            <div className="projects-item">
                <div className="projects-dateContainer">
                    <span className="projects-date">06.2018 — 02.2019</span>
                </div>
                <h3>
                    Фронтендер <a href="https://belvg.com/">BelVG</a>
                </h3>
                <p>Писал фронт и бэк–части для Magento 2 и Prestashop, верстал под разные форматы, языки и прочее.</p>
                <p>Помог обновить клиентский сайт с Prestashop 1.6 до 1.7 (переписывание 80% кода), задизайнил и написал
                    банковский конфигуратор карт, исправил тысячи багов на сотнях сайтов.</p>
            </div>
            <div className="projects-item">
                <div className="projects-dateContainer">
                    <span className="projects-date">05.2017 — 06.2018</span>
                </div>
                <h3>
                    Разработчик и дизайнер в <a href="https://cifra.in/">Цифре</a>
                </h3>
                <p>Разработал логотип, айдентику и дизайн сайта. Контролировал реализацию дизайна, ввёл автоматизированные тесты
                    и деплой.</p>
                <p>Контролировал работу штата программистов. Занимался построением архитектуры, проводил ревью, писал код на PHP
                    и JavaScript.</p>
            </div>
            <div className="projects-item">
                <div className="projects-dateContainer">
                    <span className="projects-date">09.2016 — 05.2017</span>
                </div>
                <h3>
                    Разработчик, дизайнер и техлид в <a href="https://cmtscience.ru/">CMT</a>
                </h3>
                <p>Спроектировал, задизайнил и запустил новую версию сайта на самописном движке. Сделал мощную динамическую
                    админку, которая позволяет с удобством для редакторов писать статьи.</p>
                <p>Проектировал и выстраивал микросервисную архитектуру. Проводил собеседования, собирал команду. Написал и
                    оформил редполитику.</p>
            </div>
            <div className="projects-item">
                <div className="projects-dateContainer">
                    <span className="projects-date">09.2016 — 05.2017</span>
                </div>
                <h3>
                    Фуллстек в <a href="https://efo.ru/">ЭФО</a>
                </h3>
                <p>Создавал сайты внутренних проектов, автоматизировал рутинные задачи для менеджеров, поддерживал и переписывал
                    старый сайт.</p>
                <p>Проектировал, писал и запускал сложный конфигурируемый поисковик по продуктам компании.</p>
            </div>
            <div className="projects-item">
                <div className="projects-dateContainer">
                    <span className="projects-date">04.2013 — 09.2016</span>
                </div>
                <h3>
                    Фрилансер
                </h3>
                <p>Разработал несчётное количество лендингов и интернет–магазинов. Нарисовал 30 логотипов, оформил 12 айдентик,
                    спроектировал 17 сайтов.</p>
                <p>Писал на Node.JS, C#, Java, PHP. Настраивал Nginx и Apache. В ходе создания проектов осознал, что нуждаюсь в легко расширяемом универсальном движке и разработал <a href="https://github.com/mishamyrt/iznanka">Изнанку</a>.</p>
            </div>
        </div>
    )
}