document.querySelectorAll('.window').forEach(window => {
    let id = window.id
    document.getElementById(`${id}-chart-menu`).querySelector('button').onclick = ()=>{
        if(document.getElementById(`${id}-data`).classList.contains('hide-data')) document.getElementById(`${id}-data`).classList.remove('hide-data')
        else document.getElementById(`${id}-data`).classList.add('hide-data')        
    }

    document.getElementById(`${id}-chart-options-close`).onclick = ()=>{
        window.remove()
    }
})