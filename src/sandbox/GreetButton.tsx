import { component$ } from "@builder.io/qwik";
import type { User } from "./types";

export const GreetButton = component$<{ user: User }>((props) => {
  const count = props.user.greetCount ?? 0;

  return (
    <button
      onClick$={() => {
        props.user.greetCount = count + 1;
      }}
    >
      Greet {props.user.firstName} ({count})
    </button>
  );
});
