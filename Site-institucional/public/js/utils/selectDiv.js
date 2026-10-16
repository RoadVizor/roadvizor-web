function select(div, classeDiv, classeSelected, callback){
    let elementos = document.querySelectorAll(`.${classeDiv}`)

    elementos.forEach(el => {
        el.classList.remove(classeSelected);
    });

    div.classList.add(classeSelected);

    callback(div);
}

