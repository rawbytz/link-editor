// ==UserScript==
// @name         WorkFlowy Link Editor
// @namespace    https://github.com/rawbytz/
// @version      0.5
// @description  Alt+Click on links in WorkFlowy to edit the name & url
// @author       rawbytz
// @match        https://workflowy.com/*
// @match        https://*.workflowy.com/*
// @updateUrl    https://github.com/rawbytz/link-editor/raw/master/linkEditor.user.js
// @downloadUrl  https://github.com/rawbytz/link-editor/raw/master/linkEditor.user.js
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function () {
  'use strict';

  function updateLink(target, name, url) {
    if (name.length === 0 || url.length === 0) return;
    const LINK_IN_NAME = target.parentNode.parentNode.parentNode.className.includes("name");
    const parent = WF.getItemById(target.parentNode.parentNode.parentNode.parentNode.getAttribute("projectid"));
    const content = LINK_IN_NAME ? parent.getName() : parent.getNote();
    const a = new DOMParser().parseFromString(content, 'text/html').querySelector("a");
    const findMe = a ? a.outerHTML : target.href; // fix for old link format
    const nuLink = `<a href="${url}">${name}</a>`;
    const nuContent = content.replace(findMe, nuLink);
    LINK_IN_NAME ? WF.setItemName(parent, nuContent) : WF.setItemNote(parent, nuContent);
    LINK_IN_NAME ? WF.editItemName(parent) : WF.editItemNote(parent);
  }
  const htmlEscText = str => str.replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
  function showEditLink(target) {
    const inputStyle = '.inputBx{width:95%;height:20px;display:block;margin-top:5px;border:1px solid #ccc;border-radius:4px;padding:4px}';
    const buttonStyle = '.btnX{font-size:18px;background-color:#49baf2;border:2px solid;border-radius:20px;color:#fff;padding:5px 15px;margin-top:16px;margin-right:16px}.btnX:focus{border-color:#c4c4c4}';
    const textBox = `<div><input value="${htmlEscText(target.innerText)}" id="textBox" class="inputBx" type="text" spellcheck="false"></div>`;
    const linkBox = `<div><input value="${htmlEscText(target.href)}" id="linkBox" class="inputBx" type="url" spellcheck="false"></div>`;
    const body = `<div><h3>Text</h3>${textBox}<br><h3>Link</h3>${linkBox}</div>`;
    const b1 = `<button type="button" class="btnX" id="btn1">OK</button>`;
    const b2 = `<button type="button" class="btnX" id="btn2">Cancel</button>`;
    const buttons = `<div>${b1 + b2}</div>`;
    WF.showAlertDialog(`<style>${inputStyle + buttonStyle}</style>${body + buttons}`, "Edit Link");
    setTimeout(() => {
      let link, text;
      const textBox = document.getElementById("textBox");
      const linkBox = document.getElementById("linkBox");
      const btn1 = document.getElementById("btn1");
      const btn2 = document.getElementById("btn2");
      textBox.select();
      textBox.addEventListener("keyup", (event) => {
        if (event.key === "Enter") {
          btn1.click();
        }
      });
      btn1.onclick = () => {
        text = textBox.value;
        link = linkBox.value;
        WF.hideDialog();
        setTimeout(() => {
          updateLink(target, text, link)
        }, 50);
      };
      btn2.onclick = () => {
        WF.hideDialog();
      };
    }, 100);
  }

  document.body.addEventListener("click", function (e) {
    if (e.altKey && !e.ctrlKey && !e.shiftKey && !e.metaKey && e.target.className.includes("contentLink")) {
      e.preventDefault();
      e.stopPropagation();
      showEditLink(e.target);
    }
  });
})();