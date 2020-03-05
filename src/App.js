import React from 'react';
import Converter from './Converter'

class App extends React.Component { 
  constructor(props) {
    super(props);
    this.getCourse = this.getCourse.bind(this);
    this.bestPrice = this.bestPrice.bind(this);
    this.getBestPrice = this.getBestPrice.bind(this);
    this.state = {
      USD: 0,
      EUR: 0,
      showConverter: false,
      error: null,
      bestPrice: false
    };
  }
  
  //забираем курс 
  getCourse(currency) {
      return fetch(`https://api.exchangerate-api.com/v4/latest/${currency}`)
        .then(response => response.json(), 
          error => {
          //при ошибке сразу идём по второму источнику
            alert(`Ща всё будет, тянем ${currency} из другого источника`);
            fetch(`https://api.exchangeratesapi.io/latest?base=${currency}`)
            .then(res => res.json(),
                 error => {
                    //при первичной загрузке при ошибке выводим сообщение об ошибке,
                    //иначе берём сохранённое значение
                    if (this.state[currency] === 0) {
                      alert(`${currency} нет, но вы держитесь!`);
                      this.setState({
                        showConverter: false,
                        error
                      })
                    } else {
                      this.setState({
                        showConverter: true,
                      })
                    }
                })
            //запоминаем курс со второго источника
            .then(result => {
              this.setState({
                showConverter: true,
                [currency]: result['rates']['RUB']
              });
            });
          }
        )
        //запоминаем курс со первого источника
        .then(result => {
            this.setState({
              showConverter: true,
              [currency]: result['rates']['RUB']
            });
          })
        //если не было ошибок, всё равно идём на второй источник
        .then(res => 
          fetch(`https://api.exchangeratesapi.io/latest?base=${currency}`)
            .then(res => res.json(),
              error => {
                alert("Других вариантов курса не завезли")
              }
            )
            .then(result => {
              //проверка на "лучшую цену"
              if (this.state[currency] !== 0 
                  && this.state[currency] > result['rates']['RUB'])
                {
                  this.setState({
                    [currency]: result['rates']['RUB']
                  })
                }
            })
       );
  }
  
  //функции, вызываемые при нажатии кнопки поиска лучшей цены
  bestPrice(e) {
    let btn = e.target;
    this.setState({
      bestPrice: !this.state.bestPrice
    }, () => {
      btn.classList.toggle('best-on');
      
      //если кнопка нажата, то отключаем таймер у обычной функции
      //если отжата - то включаем таймер обратно
      if (this.state.bestPrice) {
        clearInterval(this.interval);
        this.getBestPrice('USD');
        this.getBestPrice('EUR');
      } else {
        this.interval = setInterval(() => {
          this.getCourse('USD');
          this.getCourse('EUR');
        }, 60000);
      }
    })
  }
  
  //вычисляем лучшую цену
  getBestPrice(currency) {
    this.setState({
      //можно обнулить курс валют после обычной функции, а можно не обнулять
      //[currency]: 0,
      showConverter: false
    })
    
    let firstSource = fetch(`https://api.exchangerate-api.com/v4/latest/${currency}`); 
    let secondSource = fetch(`https://api.exchangeratesapi.io/latest?base=${currency}`);
    
    //одновременно выполняем оба запроса
    Promise.all([firstSource, secondSource])
      .then(sources => {
        this.setState({
          showConverter: true
        })
        sources.forEach(source => {
          process(source.json())
        })
        
      })
      .catch(error => {
        //при ошибке при первичной загрузке выводим ошибку,
        //иначе берём сохранённые данные
        if (this.state[currency] === 0) {
          this.setState({
            showConverter: false,
            error
          })
        } else {
          this.setState({
            showConverter: true, 
          })
        }
      }) 
    
      //обработка для каждого промиса в цикле Promise.all
      let process = (prom) => {
        prom.then(res => {
          //при первичной загрузке устанавливаем курс в стэйт,
          //если данные уже есть, находим лучшую цену
          if (this.state[currency] === 0) {
            this.setState({
              [currency]: res.rates['RUB']
            })
          } else if (res.rates['RUB'] < this.state[currency]) {
            this.setState({
              [currency]: res.rates['RUB']
            })
          }
        })
      }
  }
  
  componentDidMount() {
    this.getCourse('USD');
    this.getCourse('EUR');
    
    this.interval = setInterval(() => {
      this.getCourse('USD');
      this.getCourse('EUR');
    }, 60000);
  }
  
  componentWillUnmount() {
      clearInterval(this.interval);
  }
  
  render() {
    if (this.state.error) {
      return <p>Что-то пошло не так, попробуйте в следующий раз</p>
    } else
    return (
      this.state.showConverter 
        ? <div>
            <Converter dollarcourse={this.state.USD} eurocourse={this.state.EUR} />
            <button type="button" onClick={this.bestPrice} >Гарантия лучшей цены</button>
          </div>
        : <p>Подгружаем курс, как можем</p>
    );
  }
}

export default App;