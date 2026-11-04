// Content for "Центр справки и поддержки": short explainers that make a complex topic simple.
// Every topic follows the same structure: why it's hard → a simple model → try it → mistakes → cheat sheet.

export type HelpSandbox = "nodes" | "autolayout" | "prompt";

export interface HelpTopic {
  id: string;
  title: string;
  subtitle: string;
  sandbox: HelpSandbox;
  why: string;
  model: string;
  principles: string[];
  tryIt: string;
  mistakes: string[];
  cheatsheet: Array<[string, string]>;
  related: string[];
}

export const helpTopics: HelpTopic[] = [
  {
    id: "nodes",
    title: "Как читать нодовые редакторы",
    subtitle: "Weave, ComfyUI, Blender — одна и та же логика",
    sandbox: "nodes",
    why: "Открываешь граф — и видишь паутину из десятков блоков и проводов. Кажется, что нужно понять всё сразу. На деле достаточно одного правила: данные текут слева направо, и каждая нода делает ровно одно действие.",
    model: "Нода — это станция на конвейере. Слева приезжает заготовка (вход), внутри с ней что-то делают (параметры), справа уезжает результат (выход). Провод — лента между станциями. Итог зависит только от цепочки, которая доходит до ноды вывода: всё, что к ней не подключено, просто не работает.",
    principles: [
      "Читайте граф с конца: найдите вывод и идите по проводам назад.",
      "Одна нода — одно действие. Если нода «делает всё», её стоит разбить.",
      "Превью на каждой ноде — промежуточный результат. Ищите место, где картинка «сломалась».",
    ],
    tryIt: "Отсоедините провод между «Цветом» и «Размытием» и посмотрите на вывод. Подключите «Источник» прямо к «Выводу». Поменяйте порядок: сначала «Постеризация», потом «Цвет». Ноды можно двигать за заголовок, провод снимается щелчком.",
    mistakes: [
      "Крутить параметры ноды, которая не подключена к выводу, и удивляться, что ничего не меняется.",
      "Собирать всё в одну длинную цепочку. Проще разбить на группы: подготовка, генерация, доводка.",
      "Не смотреть промежуточные превью и искать ошибку только в финальной картинке.",
      "Дублировать одну и ту же настройку в нескольких ветках вместо одной общей ноды-параметра.",
    ],
    cheatsheet: [
      ["Нода", "одно действие над данными"],
      ["Вход / выход", "что нода принимает и что отдаёт"],
      ["Провод", "передаёт результат следующей ноде"],
      ["Вывод", "то, что вы увидите в итоге"],
      ["Превью", "промежуточный результат ноды"],
      ["Группа", "несколько нод с одной общей задачей"],
    ],
    related: ["autolayout", "prompt"],
  },
  {
    id: "autolayout",
    title: "Автолейаут в Figma на одной схеме",
    subtitle: "Направление, отступы, выравнивание и три режима размера",
    sandbox: "autolayout",
    why: "В панели автолейаута десяток настроек, и непонятно, какая за что отвечает. Поэтому его включают «на всякий случай», а потом макет разъезжается при первой правке текста.",
    model: "Автолейаут — это коробка, которая сама раскладывает содержимое. У коробки четыре вопроса: в какую сторону класть, какой зазор между элементами, какой отступ от стенок и к какому краю прижимать. У каждого элемента внутри — один вопрос: какой у меня размер. Свой (Fixed), по содержимому (Hug) или всё свободное место (Fill).",
    principles: [
      "Расстояния задаёт рамка (gap и padding), а не пустые прямоугольники.",
      "Выравнивание — свойство рамки, а не каждого элемента.",
      "Fill работает, только если у рамки есть свободное место, то есть её размер не Hug.",
    ],
    tryIt: "Переключите направление. Поставьте среднему элементу Fill и посмотрите, как он забирает свободное место. Переведите рамку в Hug — и Fill станет нечего заполнять. Справа видно, как то же самое записывается в CSS.",
    mistakes: [
      "Ставить Fill элементу внутри рамки с Hug: заполнять нечего, и Figma молча переключит режим.",
      "Делать отступы пустыми прямоугольниками вместо gap и padding.",
      "Двигать элементы вручную внутри автолейаута — они вернутся на место.",
      "Не называть вложенные рамки: через неделю уже не понять, что за что отвечает.",
    ],
    cheatsheet: [
      ["Направление", "горизонтально или вертикально"],
      ["Gap", "зазор между элементами"],
      ["Padding", "отступ от краёв рамки"],
      ["Выравнивание", "к какому краю прижать содержимое"],
      ["Fixed", "свой размер, не меняется"],
      ["Hug", "размер по содержимому"],
      ["Fill", "всё свободное место в рамке"],
    ],
    related: ["nodes", "prompt"],
  },
  {
    id: "prompt",
    title: "Как поставить задачу ИИ, чтобы получился прототип",
    subtitle: "Шесть блоков, без которых получается красивая заглушка",
    sandbox: "prompt",
    why: "Запрос «сделай CRM для телеграма» почти всегда даёт красивую, но бесполезную заготовку. Модель не знает, кто будет ей пользоваться, какие есть данные и когда работа считается готовой, — и додумывает сама.",
    model: "Хорошая постановка — это мини-бриф из шести блоков: контекст, пользователь, сценарий, данные, ограничения и критерий готовности. Каждый пропущенный блок модель заполнит своей догадкой, и обычно не той.",
    principles: [
      "Один запрос — один экран или один сценарий, а не весь продукт сразу.",
      "Пример реальных данных полезнее любого описания полей.",
      "Критерий готовности — это проверка, которую можно выполнить руками.",
    ],
    tryIt: "Включайте и выключайте блоки. Справа собирается запрос, а под ним видно, что модель додумает сама, если блока нет. Пример — мини-CRM для заявок из Telegram.",
    mistakes: [
      "Просить весь продукт одним сообщением вместо одного сценария за раз.",
      "Не давать пример данных: модель придумает поля, которых у вас нет.",
      "Не описывать, как проверить результат, и принимать «выглядит готово» за «работает».",
      "Исправлять ошибки, переписывая весь запрос, вместо точечной правки одного пункта.",
    ],
    cheatsheet: [
      ["Контекст", "что за продукт и какую проблему решает"],
      ["Пользователь", "кто и в какой ситуации им пользуется"],
      ["Сценарий", "шаги от начала до результата"],
      ["Данные", "какие поля и один реальный пример"],
      ["Ограничения", "платформа, стек, чего не делать"],
      ["Готовность", "как руками проверить, что всё работает"],
    ],
    related: ["nodes", "autolayout"],
  },
];

const helpTopicsEn: HelpTopic[] = [
  {
    id: "nodes",
    title: "How to read node editors",
    subtitle: "Weave, ComfyUI, Blender — the same logic everywhere",
    sandbox: "nodes",
    why: "You open a graph and see a web of dozens of blocks and wires. It feels like you need to understand everything at once. In fact one rule is enough: data flows left to right, and each node does exactly one thing.",
    model: "A node is a station on a conveyor. A blank arrives on the left (input), something is done to it inside (parameters), and the result leaves on the right (output). A wire is the belt between stations. The result depends only on the chain that reaches the output node: anything not connected to it simply does nothing.",
    principles: [
      "Read the graph from the end: find the output and follow the wires back.",
      "One node, one action. If a node \"does everything\", split it.",
      "The preview on each node is an intermediate result. Look for where the picture \"broke\".",
    ],
    tryIt: "Disconnect the wire between Color and Blur and watch the output. Connect Source straight to Output. Change the order: Posterize first, then Color. Drag nodes by their header; click a wire to remove it.",
    mistakes: [
      "Tweaking a node that is not connected to the output and wondering why nothing changes.",
      "Building everything as one long chain. It is easier to split it into groups: prep, generation, finishing.",
      "Ignoring intermediate previews and looking for the bug only in the final image.",
      "Duplicating the same setting across branches instead of one shared parameter node.",
    ],
    cheatsheet: [
      ["Node", "one action on the data"],
      ["Input / output", "what a node takes and what it gives"],
      ["Wire", "passes the result to the next node"],
      ["Output", "what you see in the end"],
      ["Preview", "a node's intermediate result"],
      ["Group", "several nodes with one shared job"],
    ],
    related: ["autolayout", "prompt"],
  },
  {
    id: "autolayout",
    title: "Figma auto layout in one diagram",
    subtitle: "Direction, spacing, alignment and the three sizing modes",
    sandbox: "autolayout",
    why: "The auto layout panel has a dozen settings, and it is unclear which does what. So people turn it on \"just in case\", and the layout falls apart at the first text edit.",
    model: "Auto layout is a box that arranges its contents by itself. The box answers four questions: which way to stack, how big the gap between items is, how much padding from the walls, and which edge to align to. Each item inside answers one question: how big am I. Its own size (Fixed), as big as its content (Hug), or all the free space (Fill).",
    principles: [
      "Spacing comes from the frame (gap and padding), not from empty rectangles.",
      "Alignment is a property of the frame, not of each item.",
      "Fill only works if the frame has free space, meaning its size is not Hug.",
    ],
    tryIt: "Switch the direction. Set the middle item to Fill and watch it take the free space. Switch the frame to Hug, and Fill has nothing left to fill. On the right you can see the same thing written in CSS.",
    mistakes: [
      "Setting Fill on an item inside a Hug frame: there is nothing to fill, and Figma quietly switches the mode.",
      "Making spacing with empty rectangles instead of gap and padding.",
      "Moving items by hand inside auto layout — they snap back.",
      "Leaving nested frames unnamed: in a week nobody knows what does what.",
    ],
    cheatsheet: [
      ["Direction", "horizontal or vertical"],
      ["Gap", "space between items"],
      ["Padding", "space from the frame's edges"],
      ["Alignment", "which edge the content sticks to"],
      ["Fixed", "its own size, does not change"],
      ["Hug", "sized by content"],
      ["Fill", "all the free space in the frame"],
    ],
    related: ["nodes", "prompt"],
  },
  {
    id: "prompt",
    title: "How to brief an AI so you get a prototype",
    subtitle: "Six blocks that separate a prototype from a pretty placeholder",
    sandbox: "prompt",
    why: "A request like \"build a CRM for Telegram\" almost always gives a nice but useless mock-up. The model does not know who will use it, what data exists or when the job is done, so it makes things up.",
    model: "A good brief has six blocks: context, user, scenario, data, constraints and a definition of done. Every missing block gets filled with the model's own guess, and usually the wrong one.",
    principles: [
      "One request, one screen or one scenario — not the whole product at once.",
      "An example of real data beats any description of the fields.",
      "The definition of done is a check you can run by hand.",
    ],
    tryIt: "Toggle the blocks on and off. The request builds up on the right, and below it you can see what the model will invent when a block is missing. The example is a mini CRM for leads from Telegram.",
    mistakes: [
      "Asking for the whole product in one message instead of one scenario at a time.",
      "Giving no data example: the model will invent fields you do not have.",
      "Not saying how to check the result, and taking \"looks done\" for \"works\".",
      "Fixing mistakes by rewriting the whole request instead of editing one point.",
    ],
    cheatsheet: [
      ["Context", "what the product is and what problem it solves"],
      ["User", "who uses it and in what situation"],
      ["Scenario", "the steps from start to result"],
      ["Data", "which fields, plus one real example"],
      ["Constraints", "platform, stack, what not to do"],
      ["Done", "how to check by hand that it all works"],
    ],
    related: ["nodes", "autolayout"],
  },
];

export function helpTopicsFor(locale: "ru" | "en"): HelpTopic[] {
  return locale === "en" ? helpTopicsEn : helpTopics;
}

export function getHelpTopic(id: string | undefined, locale: "ru" | "en" = "ru") {
  return helpTopicsFor(locale).find(topic => topic.id === id);
}
