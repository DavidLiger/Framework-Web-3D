var domElements =
`
<div>
  <button id='portfolio_1'>Portfolio - Artiste</button>
</div>
`

class View {

  constructor() {
    document.getElementById('container').innerHTML = domElements
  }

}

export { View }
