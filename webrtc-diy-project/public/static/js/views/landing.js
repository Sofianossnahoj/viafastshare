import abstractView from "./abstractView.js";

export default class extends abstractView {
  constructor() {
    super();
    this.setTitle("Landing");
  }

  async getHtml() {
    return `
   <main class="landing">
    <section class="landing__card"> 
      <h1>Welcome to this share application</h1>
      <article class="landing__form">
        <h3> Please enter your name </h3>
          <input class="landing__input" type="text" id="enterName" />
          <button class="button" id="nameOKBtn" >Add your name</button>
          <p id="alertName"></p>
          <br>
          <a id="connectCondition" href="/createRoom" data-link>Connect </a> 
        </article>
    </section>
   </main>
    `;
  }
}
