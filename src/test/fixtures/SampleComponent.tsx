/* eslint-disable */
/* prettier-ignore */
// @ts-nocheck
import React, { useState, useEffect } from 'react';
import CustomHook from './hooks/useCustom';
import { helper } from '../utils/helpers';
import { cn } from 'clsx';
import { cva } from 'class-variance-authority';
import 'tailwindcss/tailwind.css';

const buttonVariants = cva('px-4 py-2 rounded', {
  variants: {
    intent: {
      primary: 'bg-blue-500 text-white',
      secondary: 'bg-gray-200 text-gray-800',
    },
    size: {
      small: 'text-sm',
      large: 'text-lg',
    },
  },
  defaultVariants: {
    intent: 'primary',
    size: 'small',
  },
});

// Function declaration component
export function MyComponent(props) {
  const [count, setCount] = useState(0);
  const result = CustomHook(props.data);
  const buttonClass = cn('font-bold', count > 5 ? 'text-red-500' : 'text-green-500');

  useEffect(() => {
    console.log(count);
  }, [count]);

  return (
    <section>
      <h1 className="text-2xl font-bold">{props.title}</h1>
      <CustomComponent someProp={count} />
      <div className={buttonClass}>{result}</div>
      <button className={buttonVariants({ intent: 'secondary', size: 'large' })}>Click me</button>
    </section>
  );
}

// Arrow function component
export const ArrowComponent = props => {
  return <div>Arrow Function Component</div>;
};

// Function expression component
export const ExpressionComponent = function (props) {
  return <div>Function Expression Component</div>;
};

// Class component
export class ClassComponent extends React.Component {
  render() {
    return <div>Class Component</div>;
  }
}

export default MyComponent;
