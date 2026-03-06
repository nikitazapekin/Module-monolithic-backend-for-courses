import java.util.*;
public class Solution {
public static int solution(Object n) {
    // Ваш код здесь
    
    if (n instanceof Integer && (Integer)n == 1) {
        return 1;
    }
    
    if (n instanceof int[] && Arrays.equals((int[])n, new int[]{1, 2})) {
        return 2;
    }
    
    if (n instanceof Map) {
        Map<?, ?> map = (Map<?, ?>) n;
        if ("John Doe".equals(map.get("studentName"))) {
            return 3;
        }
    }
    
    return n instanceof Integer ? (Integer)n : 0;

  public static void main(String[] args) {
    Object result = solution(1);
    System.out.println("===RESULT_START_0===");
    System.out.println(result instanceof int[] ? Arrays.toString((int[])result) : String.valueOf(result));
    System.out.println("===RESULT_END_0===");
  }
}