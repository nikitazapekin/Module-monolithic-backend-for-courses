public class Main {
      static class Test2 {
          private String field1;

          public Test2(String field1) {
              this.field1 = field1;
          }

          public String getField1() {
              return field1;
          }

          public void setField1(String field1) {
              this.field1 = field1;
          }
      }

      public static Test2 yourFunction(int arg1) {
          Test2 test = new Test2("12");
          System.out.println("HELLO " + arg1);
          return test;
      }
  

    private static String __escapeJson(String value) {
        if (value == null) {
            return "";
        }

        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < value.length(); i++) {
            char ch = value.charAt(i);
            switch (ch) {
                case '\\':
                    sb.append("\\\\");
                    break;
                case '"':
                    sb.append("\"");
                    break;
                case '\n':
                    sb.append("\\n");
                    break;
                case '\r':
                    sb.append("\\r");
                    break;
                case '\t':
                    sb.append("\\t");
                    break;
                case '\b':
                    sb.append("\\b");
                    break;
                case '\f':
                    sb.append("\\f");
                    break;
                default:
                    sb.append(ch);
            }
        }
        return sb.toString();
    }

    private static String __serializeJson(Object value) {
        return __serializeJson(value, new java.util.IdentityHashMap<>());
    }

    private static String __serializeJson(Object value, java.util.IdentityHashMap<Object, Boolean> visited) {
        if (value == null) {
            return "null";
        }
        if (value instanceof String || value instanceof Character) {
            return '"' + __escapeJson(String.valueOf(value)) + '"';
        }
        if (value instanceof Number || value instanceof Boolean) {
            return String.valueOf(value);
        }

        Class<?> clazz = value.getClass();

        if (clazz.isArray()) {
            int length = java.lang.reflect.Array.getLength(value);
            java.util.List<String> items = new java.util.ArrayList<>();
            for (int i = 0; i < length; i++) {
                items.add(__serializeJson(java.lang.reflect.Array.get(value, i), visited));
            }
            return "[" + String.join(", ", items) + "]";
        }

        if (value instanceof java.util.Collection<?>) {
            java.util.List<String> items = new java.util.ArrayList<>();
            for (Object item : (java.util.Collection<?>) value) {
                items.add(__serializeJson(item, visited));
            }
            return "[" + String.join(", ", items) + "]";
        }

        if (value instanceof java.util.Map<?, ?>) {
            java.util.Map<String, String> entries = new java.util.TreeMap<>();
            for (java.util.Map.Entry<?, ?> entry : ((java.util.Map<?, ?>) value).entrySet()) {
                String key = String.valueOf(entry.getKey());
                entries.put(key, '"' + __escapeJson(key) + "\":" + __serializeJson(entry.getValue(), visited));
            }
            return "{" + String.join(", ", entries.values()) + "}";
        }

        if (visited.containsKey(value)) {
            return '"' + "<circular>" + '"';
        }

        visited.put(value, Boolean.TRUE);

        java.util.List<java.lang.reflect.Field> fields = new java.util.ArrayList<>();
        Class<?> current = clazz;
        while (current != null && current != Object.class) {
            for (java.lang.reflect.Field field : current.getDeclaredFields()) {
                int modifiers = field.getModifiers();
                if (java.lang.reflect.Modifier.isStatic(modifiers) || field.isSynthetic()) {
                    continue;
                }
                fields.add(field);
            }
            current = current.getSuperclass();
        }

        fields.sort(java.util.Comparator.comparing(java.lang.reflect.Field::getName));

        java.util.List<String> serializedFields = new java.util.ArrayList<>();
        for (java.lang.reflect.Field field : fields) {
            try {
                field.setAccessible(true);
                serializedFields.add(
                    '"' +
                    __escapeJson(field.getName()) +
                    "\":" +
                    __serializeJson(field.get(value), visited)
                );
            } catch (IllegalAccessException e) {
                serializedFields.add(
                    '"' +
                    __escapeJson(field.getName()) +
                    "\":" +
                    __serializeJson("<inaccessible>", visited)
                );
            }
        }

        visited.remove(value);
        return "{" + String.join(", ", serializedFields) + "}";
    }

    public static void main(String[] args) {

        // Тест 1
        {
            java.io.ByteArrayOutputStream baos = new java.io.ByteArrayOutputStream();
            java.io.PrintStream originalOut = System.out;
            System.setOut(new java.io.PrintStream(baos));
            
            try {
                Object result = yourFunction(1);
                
                System.setOut(originalOut);
                
                String logs = baos.toString();
                
                if (logs != null && !logs.isEmpty()) {
                    System.out.println("===LOGS_START_" + 1 + "===");
                    System.out.print(logs);
                    if (!logs.endsWith("\n")) {
                        System.out.println();
                    }
                    System.out.println("===LOGS_END_" + 1 + "===");
                }
                
                System.out.println("===RESULT_START_" + 1 + "===");
                System.out.print(__serializeJson(result));
                System.out.println();
                System.out.println("===RESULT_END_" + 1 + "===");
                
            } catch (Exception e) {
                System.setOut(originalOut);
                System.out.println("===RESULT_START_" + 1 + "===");
                System.out.print("{\"error\":" + __serializeJson(e.getMessage()) + "}");
                System.out.println();
                System.out.println("===RESULT_END_" + 1 + "===");
            }
        }
    }
}

    class Test2 {
        private String field1;

    public Test2(String field1) {
        this.field1 = field1;
    }

    public String getField1() {
        return field1;
    }
    public void setField1(String field1) {
        this.field1 = field1;
    }
    }