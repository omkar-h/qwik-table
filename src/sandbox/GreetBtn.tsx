import { component$, useSignal } from "@builder.io/qwik";

export const GreetButton = component$<{ name: string }>((props) => {
  const clickCount = useSignal(0);

  return (
    <button onClick$={() => clickCount.value++}>
      Greet {props.name} ({clickCount.value})
    </button>
  );
});
