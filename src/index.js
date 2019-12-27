import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

const DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
const OPERATIONS = ['/', 'x', '+', '-'];
const OPERATIONS_SANS_MINUS = ['/', 'x', '+'];

function Display(props){  // component which shows the expression due to be calculated and the result of the calculation 
    // props (come from Calculator parent component): expression - what to calculate
    //        result: the result of calculations
    return(
      <div className = "outputWindow">
        <div className = "display-field" id = "display">{props.expression}</div>
        <div className = "display-field" id = "result-field">{props.result}</div>
      </div>
    )
}

function CalculatorButton(props){ // button of the calculator
  // props: addClass - the additional class(es) ('widthdoubled', 'heghtdoubled', etc.) 
  //        id - the id attribute of component
  //        txt - text written on the button
  //        onClick - function handling the onClick event executes on parent component Calculator
    return(
      <button className = {"calculator-pad " + props.addClass} 
              id = {props.id}
              onClick = {props.onClick}>
        {props.txt}
      </button>
    )
}

class Calculator extends React.Component{ // the main component containing all logic 
    constructor(props){
        super(props);
        this.state = {
          expression: '0',  // current expression to be calculated (the expression entered by user)
          str: '0',         // current string which will be pushed into one of two arrays, numbers or operations (ops)
          numbers: [],      // the array of numbers to calculate 
          ops: [],          // the array of operations to execute on numbers: numbers == ['3', '5', '4'] and ops == ['+', 'x'] calculates as 3+5*4
          result: 0,
          // at the end, when '=' is pressed, we may have the following: numbers: ['3', '5'], ops: ['+', 'x'], str: '4' => push str to numbers and calculate. 
        }
        this.handleClick = this.handleClick.bind(this);
    };
    
    checkBeginning(){
      return this.state.numbers.length === 0 && this.state.str === '0'
    }

    addDigit(digit){  // digit button pressed, the state should be updated
      let ops = this.state.ops.slice(0);
      // if we're in the beginning of the process, change expression and str:
      if(this.checkBeginning()){ 
        this.setState({expression: digit,
                        str: digit});
        return;
      }
      // possibilities in the middle of the process:
      // 1) continue to enter digits of number (previous symbol is digit or point):
      //    concatenate digit to str and  to expression
      // 2) start to enter the number after the symbol of operation:
      //    push str to ops array; 
      //    str = digit, concatenate expression
      // 3) previous symbol is '-' => requires the additional check for pre-previous symbol:
      //  3.1) pre-prev is a digit => push '-' to ops; str = digit; concatenate expression with digit
      //  3.2) no pre-prev, str == '-' => concatenate str with digit, update expression
      //  3.3) pre-prev is operation (other then '-' because it wouldn't be entered otherwise) => concatenate str with digit, update expression
      const lastSymbol = this.state.str[this.state.str.length-1];
      if(DIGITS.includes(lastSymbol) || lastSymbol === '.'){      // (1)
        this.setState((state) => ({str: state.str.concat(digit),
                       expression: state.expression.concat(digit)}));
        return;
      }

      let preLastSymbol;
      if(lastSymbol === '-'){  // (3)
        if(this.state.expression.length === 0){ // (3.2)
          this.setState({
              str: '-'+digit,
            });
        }
        else{
          preLastSymbol = this.state.expression[this.state.expression.length-2];
          if(DIGITS.includes(preLastSymbol)){ // (3.1)
            this.setState((state) => ({
                  ops: state.ops.concat('-'),
                  str: digit,
            }))
          }
          else{  // (3.3)
            this.setState({str: '-' + digit});
          }
        }
        this.setState((state) => ({
          expression: state.expression.concat(digit),
        }))
        return;
      }
      if(OPERATIONS.includes(lastSymbol)){  // (2)
        this.setState((state) => ({ ops: ops.concat(this.state.str),
                        str: digit,
                        expression: state.expression.concat(digit)}));
        return;
      }
    }

    addMinus(){  // minus may belong to number or to be the operation
      if(this.checkBeginning()){  // in the beginning just put '-' into str and update expression
        this.setState({
          str: '-',
          expression: '-',
        });
        return;
      }
      // possibilities in the middle of entering:
      // 1) minus goes after a digit: push str to numbers, str = '-', update expression
      // 2) minus goes after another operation: push str to ops, str = '-', update expression

      const lastSymbol = this.state.str[this.state.str.length-1];
      if(DIGITS.includes(lastSymbol)) // (1)
        this.setState((state) => ({
                        numbers: state.numbers.concat(this.state.str),
                        str: '-',
                        expression: state.expression.concat('-'),
                      }))
      else{
        if(OPERATIONS_SANS_MINUS.includes(this.state.str)) // (2)
            this.setState((state) => ({
                            ops: state.ops.concat(this.state.str),
                            str: '-',
                            expression: state.expression.concat('-'),
                          }));
        }
    }

    addOperation(op){  // operations except minus
      // possibilities:
      // 1) operation entered after another operation: change the last operation with the new one
      // 2) operation entered after '-' operation (if str == '-'): 
      // additional check required:
      // (2.1) if '-' is the first symbol entered do the same as (1)
      // (2.2) if the symbol before '-' is digit => remove numbers[lastnumber], save it to str, add op to ops;
      // (2.3) if it's the operation: the same as (1)
      // 3) operation entered after digit: push str to numbers, str = operation, update expression 
      const lastSymbol = this.state.str[this.state.str.length-1];
      let preLastSymbol;
      if(OPERATIONS.includes(lastSymbol)){  // (1) & (2)
        if(lastSymbol === '-'){ // (2)
          if(this.state.expression.length === 1){  // (2.1)
            this.setState({
                str: op,
                expression: op,
              });
          }
          else{
            preLastSymbol = this.state.expression[this.state.expression.length-2];
            if(DIGITS.includes(preLastSymbol)){ // (2.2)
                this.setState((state) => ({str: state.numbers[state.numbers.length-1]}));
                this.setState((state) => ({numbers: state.numbers.slice(0, state.numbers.length-1),
                               ops: state.ops.concat(op)}));                  
            }
            else{ // (2.3)
              this.setState((state) => ({ops: state.ops.slice(0, state.ops.length-1),//
                 expression: state.expression.slice(0, state.expression.length-1).concat(op),
                 str: op}));
            }
          }
          return;
        } 
        else{  //(1)
          // ops = this.state.ops.slice(0, this.state.ops.length-1); // pop the last operation from the array of operations
          // ops.push(op); // push the new operation on the last place in the array of operations
          // console.log(ops);
          this.setState((state) => ({ops: state.ops.slice(0, state.ops.length-1),//
            expression: state.expression.slice(0, state.expression.length-1).concat(op),
            str: op}));
        } 
        return;
      } 
      // (3):
      this.setState((state) => ({
        numbers: state.numbers.concat(state.str),
        str: op,
      }))
      this.setState((state) => ({expression: state.expression.concat(op)}));
    }

    addPoint(){ // add '.'
      // possibilities:
      // 1) in the beginning: change str and expression to '0.'
      // 2) after a digit: look for the existance of point in the same number! if exists - do nothing, if not => str = str + '.', update expression
      // 3) after an operation: push str to ops, str = '0.', update expression
      // 4) after point: do nothing - don't add it!

      if(this.checkBeginning()){  // (1)
        this.setState({str: '0.', expression: '0.'});
        
        return;          
      }
      const lastSymbol = this.state.str[this.state.str.length-1];

      if(DIGITS.includes(lastSymbol)){  // (2)
        if(this.state.str.indexOf('.') === -1)
          this.setState({ str: this.state.str + '.', 
                          expression: this.state.expression + '.'});
        return;
      }
      if(OPERATIONS.includes(lastSymbol)){  // (2)
        this.setState({ops: this.state.ops.concat(this.state.str), 
                        str: '0.',
                        expression: this.state.expression + '0.'});
        return;
      }
    }

    calcExpression(){  // possibilities when '=' is pressed:
                       // 1. last entered symbol is digit => add str to numbers, evaluate expression (numbers, ops)
                       // 2. last entered symbol id operation => ignore it, don't add str, evaluate expression (numbers, ops)
                       // prepare for next steps: numbers = result, ops = [] 

      if(DIGITS.includes(this.state.str[this.state.str.length-1])){
        return evaluateExpression(this.state.numbers.slice(0).concat(this.state.str), this.state.ops);   
      }
      else{
        this.setState({str: '0'});
        return evaluateExpression(this.state.numbers, this.state.ops);   
      }
    }

    handleClick(btn){
      if(btn === 'C'){  // clear the display, go to the initial state
        this.setState({
          expression: '0',
          str: '0',
          numbers: [],
          ops: [],
          result: '0',
        })
      }

      if(DIGITS.includes(btn)){  // if digit button is pressed
          this.addDigit(btn);
          return;
      }
      if(btn === '.'){
          this.addPoint();
          return;
      }
      if(OPERATIONS.includes(btn)){  // if button pressed is the symbol of operation: +, - , /, x
        if(this.checkBeginning()){
          if(OPERATIONS_SANS_MINUS.includes(btn)) // only leading minus is allowed
            return;
        }
        if(btn === '-')
            this.addMinus();
        else
            this.addOperation(btn);  
        return;
      }

      if(btn === '='){  
        this.setState({result: this.calcExpression()});
        this.setState((state) => ({   // update initial meanings to be ready for further calculations
              expression: '' + state.result,
              str: '' + state.result,
              numbers: [],
              ops: [],
        }))

      }
    }

    render(){
      return(
          <div className = "calculator">
            <Display expression = {this.state.expression} result = {this.state.result} />
            <div className = "calculator-row">
              <CalculatorButton addClass = "widthdoubled" id = "clear" txt = "C"  onClick = {() => this.handleClick('C')} />
              <CalculatorButton addClass = "" id = "divide" txt = "/"  onClick = {() => this.handleClick('/')} />
              <CalculatorButton addClass = "" id = "multiply" txt = "x"  onClick = {() => this.handleClick('x')} />
            </div>
            <div className = "calculator-row">
              <CalculatorButton addClass = "" id = "seven" txt = "7" onClick = {() => this.handleClick('7')}/>
              <CalculatorButton addClass = "" id = "eight" txt = "8"  onClick = {() => this.handleClick('8')} />
              <CalculatorButton addClass = "" id = "nine" txt = "9"  onClick = {() => this.handleClick('9')} />
              <CalculatorButton addClass = "" id = "subtract" txt = "-"  onClick = {() => this.handleClick('-')} />
            </div>
            <div className = "calculator-row">
                  <CalculatorButton addClass = "" id = "four" txt = "4"  onClick = {() => this.handleClick('4')} />
                  <CalculatorButton addClass = "" id = "five" txt = "5"  onClick = {() => this.handleClick('5')} />
                  <CalculatorButton addClass = "" id = "six" txt = "6"  onClick = {() => this.handleClick('6')} />
                  <CalculatorButton addClass = "" id = "add" txt = "+"  onClick = {() => this.handleClick('+')} />
            </div>
            <div className = "calculator-row heightdoubled">
                <div className = "threefourth">
                  <div className = "calculator-row">
                    <CalculatorButton addClass = "" id = "one" txt = "1" onClick = {() => this.handleClick('1')} />
                    <CalculatorButton addClass = "" id = "two" txt = "2" onClick = {() => this.handleClick('2')} />
                    <CalculatorButton addClass = "" id = "three" txt = "3"  onClick = {() => this.handleClick('3')} />
                  </div>
                  <div className = "calculator-row">
                    <CalculatorButton addClass = "widthdoubled" id = "zero" txt = "0"  onClick = {() => this.handleClick('0')} />
                    <CalculatorButton addClass = "" id = "decimal" txt = "."  onClick = {() => this.handleClick('.')} />
                  </div>
                </div>
                <CalculatorButton addClass = "heightdoubled" id = "equals" txt = "="  onClick = {() => this.handleClick('=')} />
            </div>
          </div>
      )
    }
}

ReactDOM.render(<Calculator />, document.getElementById('root'));

function evalOp(left, right, op){
  switch(op){
    case '/': return Math.round((left / right)*100000000)/100000000;
    case 'x': return Math.round((left * right)*100000000)/100000000;
    case '+': return Math.round((left + right)*100000000)/100000000;
    case '-': return Math.round((left - right)*100000000)/100000000;
    default:  return 0;
  }
}

function evaluateExpression(expr, ops){
  let result = [...expr];  // array of numbers - gonna be modified  
  let tmpOps = [...ops];   // array of operations to be executed on numbers

  let indexOp = tmpOps.indexOf('/');  // first step: find first operations with high priority
  if(indexOp === -1)
    indexOp = tmpOps.indexOf('x');
  while(indexOp !== -1){  
    let res = evalOp(+result[indexOp], +result[indexOp+1], tmpOps[indexOp]); // calculate multiplication and division operations
                                              // and simplify the resulting arrays after completing the operation
                                              // e.g. [3,3,8] and [+, *] => [3, 24] and [+];   
    result.splice(indexOp, 2, res);
    tmpOps.splice(indexOp, 1);
    indexOp = tmpOps.indexOf('/');
    if(indexOp === -1)
      indexOp = tmpOps.indexOf('x');
  }
  // at this stage we only have plus and minus operations: e.g. [5, 3] and [+] => 8, or [5], [] => 5
  let finalResult = result[0];
  for(let i = 0; i < tmpOps.length; i++){
    finalResult = evalOp(+finalResult, +result[i+1], tmpOps[i]);
  }

  return finalResult;
}


