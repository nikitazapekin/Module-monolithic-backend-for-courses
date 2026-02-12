
public class Kata {
    public static int yourFunction(int n) {
        // Ваш код здесь
        System.out.println(n+1);
        return n+1;
    }
    
    public static void main(String[] args) {
        
        yourFunction(11);
        // Этот метод нужен для запуска, но не используется в тестах
    }
}

class Main {
    public static void main(String[] args) {
        try {
            // Вызываем тестируемую функцию и выводим результат
            Object result = Kata.yourFunction(5);
            
            // Конвертируем результат в строку
            if (result instanceof int[]) {
                int[] arr = (int[]) result;
                java.util.Arrays.stream(arr).forEach(System.out::println);
            } else {
                System.out.println(result);
            }
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace();
        }
    }
}