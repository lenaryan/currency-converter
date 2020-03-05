import React from 'react';

class Converter extends React.Component {
    constructor(props) {
      super(props);
      this.onRubChange = this.onRubChange.bind(this);
      this.state = {
        euro: 0,
        dollar: 0
      };
    }
    
    //высчитываем сумму валюты по полученным курсам
    onRubChange(e) {
      let neweuro = 0;
      let newdol = 0;
      if (e.target.value === "") {
          neweuro = newdol = 0;
      } else {
        if (this.props.eurocourse === 0) {
            neweuro = 0;
        } else {
          neweuro = e.target.value / this.props.eurocourse;
        }
        if (this.props.dollarcourse === 0) {
            newdol = 0;
        } else {
          newdol = e.target.value / this.props.dollarcourse
        }
      }
      this.setState({
        euro: neweuro.toFixed(2),
        dollar: newdol.toFixed(2),
      })
    };
    
    render() {
      return (
        <div className="inputs">
          <p>Введите сумму в рублях:</p>
          <input type="number" onChange={this.onRubChange} />
          <p>В долларах: ${this.state.dollar}</p>
          <p>В евро: €{this.state.euro}</p>
        </div>
      )
    }
}

export default Converter;