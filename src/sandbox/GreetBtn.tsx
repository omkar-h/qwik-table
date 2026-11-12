import { component$, useSignal } from "@builder.io/qwik";

export const GreetButton = component$<{ name: string }>((props) => {
  const clickCount = useSignal(0);

  return (
    <>
      <button onClick$={() => clickCount.value++}>Greet {props.name}</button>
      <span>
        {clickCount.value > 0 ? `Clicked ${clickCount.value} times` : ""}
      </span>
      {/* <input
        value={clickCount.value}
        onInput$={(e, ele) => (clickCount.value = ele.value)}
      />
      <span>{clickCount.value}</span> */}
    </>
  );
});
