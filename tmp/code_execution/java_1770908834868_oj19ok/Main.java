public class Kata {
    
    public static int yourFunction(int n) {
        // Ваш код здесь
        return n + 1;
    
    
    public static void main(String[] args) {
        // Пустой main метод для компиляции
    }
}

class Runner {
    public static void main(String[] args) {
        try {
            // Вызываем функцию и получаем результат
            Object result = Kata.yourFunction(2);
            
            // Выводим результат в консоль
            if (result == null) {
                System.out.println("null");
            } else if (result instanceof int[]) {
                int[] arr = (int[]) result;
                System.out.print("[");
                for (int i = 0; i < arr.length; i++) {
                    System.out.print(arr[i]);
                    if (i < arr.length - 1) System.out.print(", ");
                }
                System.out.println("]");
            } else {
                System.out.println(result);
            }
            
            System.out.flush();
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace();
        }
    }
}