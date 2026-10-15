function select(div, classeDiv, classeSelected){
    let elementos = document.querySelectorAll(`.${classeDiv}`)

    elementos.forEach(el => {
        el.classList.remove(classeSelected);
    });

    div.classList.add(classeSelected)
}

